-- Fix search_path for existing functions to prevent security issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_assign_lowest_bid()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$function$;