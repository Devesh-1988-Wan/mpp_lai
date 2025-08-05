-- Fix infinite recursion in projects table RLS policies
-- Drop all existing policies for projects table
DROP POLICY IF EXISTS "Only owners and admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: DELETE access for admins" ON public.projects;
DROP POLICY IF EXISTS "Projects: INSERT access for admins" ON public.projects;
DROP POLICY IF EXISTS "Projects: SELECT access based on role" ON public.projects;
DROP POLICY IF EXISTS "Projects: UPDATE access for admins and moderators" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects based on their role" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.projects;

-- Create new non-recursive policies for projects
CREATE POLICY "Projects: SELECT for authenticated users" 
ON public.projects 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'user'::app_role)
);

CREATE POLICY "Projects: INSERT for admins and moderators" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Projects: UPDATE for admins and moderators" 
ON public.projects 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Projects: DELETE for admins only" 
ON public.projects 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);