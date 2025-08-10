-- Add new columns to the tasks table
ALTER TABLE public.tasks
ADD COLUMN delivery_date DATE,
ADD COLUMN release_version TEXT,
ADD COLUMN num_resources INTEGER,
ADD COLUMN total_hours_available NUMERIC(10, 2);

-- It's good practice to add a comment to the new columns
COMMENT ON COLUMN public.tasks.delivery_date IS 'The planned delivery date of the task.';
COMMENT ON COLUMN public.tasks.release_version IS 'The release version associated with this task.';
COMMENT ON COLUMN public.tasks.num_resources IS 'The number of resources assigned to the task.';
COMMENT ON COLUMN public.tasks.total_hours_available IS 'The total available hours for the assigned resources.';