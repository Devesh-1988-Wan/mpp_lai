-- Create enum for task priority
CREATE TYPE public.task_priority AS ENUM ('Blocker', 'Critical', 'High', 'Medium', 'Low');

-- Add new columns to tasks table
ALTER TABLE public.tasks
ADD COLUMN priority public.task_priority DEFAULT 'Medium',
ADD COLUMN developer TEXT,
ADD COLUMN estimated_days NUMERIC(5, 2),
ADD COLUMN estimated_hours NUMERIC(5, 2);