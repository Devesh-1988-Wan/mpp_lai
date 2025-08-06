-- This script creates the 'integrations' table and sets up row-level security.

-- Create the 'integrations' table to store credentials for third-party services.
CREATE TABLE IF NOT EXISTS public.integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    service TEXT NOT NULL,
    credentials jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(project_id, service)
);

-- Grant permissions to the authenticated role for the new table.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.integrations TO authenticated;

-- Enable Row-Level Security (RLS) for the table.
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Drop the old policy if it exists to prevent conflicts.
-- The original policy might have a different name, so we use IF EXISTS.
DROP POLICY IF EXISTS "Allow authenticated users to manage integrations" ON public.integrations;

-- Create a new, more permissive policy that includes admin roles.
-- This policy allows project members and admins to manage integrations.
CREATE POLICY "Allow members and admins to manage integrations"
ON public.integrations FOR ALL
USING (
  check_user_is_member(project_id) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);
