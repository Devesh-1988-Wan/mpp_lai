-- supabase/migrations/20250807000000_add_docs_progress_to_tasks.sql

CREATE TYPE public.docs_progress_status AS ENUM (
  'Not Started',
  'In Analysis-TA',
  'In Progress',
  'Ready or Test Cases',
  'Handover',
  'Not Applicable'
);

ALTER TABLE public.tasks
ADD COLUMN docs_progress public.docs_progress_status DEFAULT 'Not Started';