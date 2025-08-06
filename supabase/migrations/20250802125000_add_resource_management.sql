-- This script creates tables for resource management and sets up row-level security.

-- Drop existing policies if they exist to prevent conflicts.
-- The 'if exists' clause prevents errors if the policies have not been created yet.
DROP POLICY IF EXISTS "Allow members to manage resources" ON public.resources;
DROP POLICY IF EXISTS "Allow members to manage resource allocations" ON public.resource_allocations;

-- Create the 'resources' table to store project resources.
CREATE TABLE IF NOT EXISTS public.resources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the 'resource_allocations' table to track resource assignments to tasks.
CREATE TABLE IF NOT EXISTS public.resource_allocations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    allocation_percentage NUMERIC(5, 2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Grant permissions to the authenticated role for the new tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resource_allocations TO authenticated;

-- Enable Row-Level Security (RLS) for the tables.
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;

-- Create a policy for the 'resources' table.
-- This policy allows project members and admins to manage resources.
CREATE POLICY "Allow members and admins to manage resources"
ON public.resources FOR ALL
USING (
  check_user_is_member(project_id) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create a policy for the 'resource_allocations' table.
-- This policy allows project members and admins to manage resource allocations.
-- It checks membership by looking up the project_id from the associated resource.
CREATE POLICY "Allow members and admins to manage resource allocations"
ON public.resource_allocations FOR ALL
USING (
  (
    SELECT check_user_is_member(r.project_id)
    FROM public.resources r
    WHERE r.id = resource_id
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);
