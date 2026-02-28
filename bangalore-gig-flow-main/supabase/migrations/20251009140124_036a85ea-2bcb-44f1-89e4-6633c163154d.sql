-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('tasker', 'helper');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('open', 'bidding', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Create enum for bid status
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  deadline TIMESTAMPTZ,
  status task_status DEFAULT 'open',
  assigned_helper_id UUID REFERENCES auth.users(id),
  winning_bid_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  estimated_hours DECIMAL(5, 2),
  message TEXT,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, helper_id)
);

-- Create transactions table for payment tracking
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tasker_id UUID NOT NULL REFERENCES auth.users(id),
  helper_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  helper_payout DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Anyone can view open tasks"
  ON public.tasks FOR SELECT
  USING (true);

CREATE POLICY "Taskers can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = tasker_id);

CREATE POLICY "Taskers can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = tasker_id);

CREATE POLICY "Taskers can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = tasker_id);

-- Bids policies
CREATE POLICY "Anyone can view bids on tasks"
  ON public.bids FOR SELECT
  USING (true);

CREATE POLICY "Helpers can create bids"
  ON public.bids FOR INSERT
  WITH CHECK (auth.uid() = helper_id);

CREATE POLICY "Helpers can update own bids"
  ON public.bids FOR UPDATE
  USING (auth.uid() = helper_id);

CREATE POLICY "Helpers can delete own bids"
  ON public.bids FOR DELETE
  USING (auth.uid() = helper_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = tasker_id OR auth.uid() = helper_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically assign task to lowest bidder
CREATE OR REPLACE FUNCTION public.check_and_assign_lowest_bid()
RETURNS TRIGGER AS $$
DECLARE
  lowest_bid_record RECORD;
BEGIN
  -- Get the lowest bid for this task
  SELECT * INTO lowest_bid_record
  FROM public.bids
  WHERE task_id = NEW.task_id
  ORDER BY amount ASC
  LIMIT 1;

  -- Update the task with the winning bid
  UPDATE public.tasks
  SET 
    winning_bid_id = lowest_bid_record.id,
    assigned_helper_id = lowest_bid_record.helper_id,
    status = 'assigned'
  WHERE id = NEW.task_id AND status = 'open';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign lowest bid
CREATE TRIGGER auto_assign_lowest_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_assign_lowest_bid();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();