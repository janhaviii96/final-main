-- Add gender to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create helper_skills junction table
CREATE TABLE public.helper_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  years_experience NUMERIC,
  certification TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(helper_id, skill_id)
);

-- Create task_required_skills junction table
CREATE TABLE public.task_required_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(task_id, skill_id)
);

-- Create verifications table for ID documents and police checks
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('aadhaar', 'pan', 'police', 'face_scan')),
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_photos table for before/after photos
CREATE TABLE public.task_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('before', 'after')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'rejected')),
  resolution TEXT,
  compensation_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add face_scan_verified column to track per-task face verification
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS face_scan_verified BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS face_scan_at TIMESTAMP WITH TIME ZONE;

-- Update transactions table for compensation
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'payment' CHECK (type IN ('payment', 'refund', 'compensation'));
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS dispute_id UUID REFERENCES public.disputes(id);

-- Enable RLS on new tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Skills policies (public read, admin write - for now anyone can read)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);

-- Helper skills policies
CREATE POLICY "Helpers can manage own skills" ON public.helper_skills FOR ALL USING (auth.uid() = helper_id);
CREATE POLICY "Anyone can view helper skills" ON public.helper_skills FOR SELECT USING (true);

-- Task required skills policies
CREATE POLICY "Anyone can view task skills" ON public.task_required_skills FOR SELECT USING (true);
CREATE POLICY "Taskers can manage task skills" ON public.task_required_skills FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND tasker_id = auth.uid()));

-- Verifications policies
CREATE POLICY "Users can view own verifications" ON public.verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own verifications" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own verifications" ON public.verifications FOR UPDATE USING (auth.uid() = user_id);

-- Task photos policies
CREATE POLICY "Anyone can view task photos" ON public.task_photos FOR SELECT USING (true);
CREATE POLICY "Users can upload photos to their tasks" ON public.task_photos FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

-- Disputes policies
CREATE POLICY "Users can view own disputes" ON public.disputes FOR SELECT 
  USING (auth.uid() = raised_by OR EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (tasker_id = auth.uid() OR assigned_helper_id = auth.uid())));
CREATE POLICY "Taskers can create disputes" ON public.disputes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND tasker_id = auth.uid()));

-- Seed initial skills
INSERT INTO public.skills (name, category) VALUES
  ('Cleaning', 'Home Services'),
  ('Deep Cleaning', 'Home Services'),
  ('Delivery', 'Logistics'),
  ('Moving & Packing', 'Logistics'),
  ('Plumbing', 'Repairs'),
  ('Electrical', 'Repairs'),
  ('Painting', 'Home Services'),
  ('Gardening', 'Outdoor'),
  ('Graphic Design', 'Creative'),
  ('Assembly', 'Home Services'),
  ('Carpentry', 'Repairs'),
  ('AC Repair', 'Repairs'),
  ('Cooking', 'Personal'),
  ('Pet Care', 'Personal'),
  ('Tutoring', 'Education');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('task-photos', 'task-photos', true);

-- Storage policies for documents (private)
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT 
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for task photos (public read)
CREATE POLICY "Anyone can view task photos storage" ON storage.objects FOR SELECT 
  USING (bucket_id = 'task-photos');
CREATE POLICY "Authenticated users can upload task photos" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

-- Create trigger for verifications updated_at
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();