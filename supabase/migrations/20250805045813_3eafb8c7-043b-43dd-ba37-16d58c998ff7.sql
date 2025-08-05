-- Fix the trigger that's causing the updated_at field error
-- Drop existing triggers and recreate them properly

-- Drop existing triggers for tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON public.tasks;

-- Create a proper trigger function that handles both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.handle_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set updated_at on UPDATE operations, not INSERT
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only for UPDATE operations on tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_column();

-- Ensure updated_at defaults to now() for INSERT operations
ALTER TABLE public.tasks 
ALTER COLUMN updated_at SET DEFAULT now();

-- Also fix any similar issues with other tables
-- Check projects table
DROP TRIGGER IF EXISTS update_projects_last_modified ON public.projects;

CREATE OR REPLACE FUNCTION public.handle_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.last_modified = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_last_modified
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_last_modified_column();