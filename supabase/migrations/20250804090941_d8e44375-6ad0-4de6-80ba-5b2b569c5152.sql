-- Fix infinite recursion in RLS policies by removing conflicting policies and creating clean ones

-- Drop all existing policies for projects table to eliminate conflicts
DROP POLICY IF EXISTS "Admin and Super Admin can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for project members and super user" ON public.projects;
DROP POLICY IF EXISTS "Moderators have view access to assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators and admin can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Super admins and admins have full access to all projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects they created or if they are admin" ON public.projects;
DROP POLICY IF EXISTS "Users can see projects they have permissions for" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects they created or if they are admin" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are part of or if they are admin" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are part of, or if they are a supe" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they created or are team members of" ON public.projects;
DROP POLICY IF EXISTS "Users with moderator/admin permissions can manage projects" ON public.projects;

-- Create clean, non-recursive policies for projects
CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view accessible projects" ON public.projects
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid() OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members)) OR
    EXISTS (
      SELECT 1 FROM project_permissions
      WHERE project_permissions.project_id = projects.id
      AND project_permissions.user_email = auth.email()
    )
  );

CREATE POLICY "Project owners and admins can update projects" ON public.projects
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_permissions
      WHERE project_permissions.project_id = projects.id
      AND project_permissions.user_email = auth.email()
      AND project_permissions.permission_level IN ('edit', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can delete projects" ON public.projects
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid()
  );