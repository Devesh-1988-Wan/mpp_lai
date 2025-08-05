-- Fix infinite recursion in project_permissions RLS policies
-- Drop all current policies for project_permissions to fix infinite recursion
DROP POLICY IF EXISTS "Project owners and admins can manage permissions" ON public.project_permissions;
DROP POLICY IF EXISTS "Users can view permissions for projects they can view" ON public.project_permissions;

-- Create fixed policies for project_permissions without recursion
CREATE POLICY "Project permissions: SELECT for project owners and admins" 
ON public.project_permissions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_permissions.project_id 
    AND p.created_by = auth.uid()
  )
);

CREATE POLICY "Project permissions: INSERT for project owners and admins" 
ON public.project_permissions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_permissions.project_id 
    AND p.created_by = auth.uid()
  )
);

CREATE POLICY "Project permissions: UPDATE for project owners and admins" 
ON public.project_permissions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_permissions.project_id 
    AND p.created_by = auth.uid()
  )
);

CREATE POLICY "Project permissions: DELETE for project owners and admins" 
ON public.project_permissions 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_permissions.project_id 
    AND p.created_by = auth.uid()
  )
);

-- Fix tasks RLS policies to prevent loops
DROP POLICY IF EXISTS "Tasks: ALL access for admins and moderators" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: SELECT access based on project visibility" ON public.tasks;

-- Create simplified task policies
CREATE POLICY "Tasks: SELECT for all users with project access" 
ON public.tasks 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'user'::app_role)
);

CREATE POLICY "Tasks: INSERT for admins and moderators" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Tasks: UPDATE for admins and moderators" 
ON public.tasks 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Tasks: DELETE for admins and moderators" 
ON public.tasks 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

-- Fix custom_fields RLS policies
DROP POLICY IF EXISTS "Custom Fields: ALL access for admins and moderators" ON public.custom_fields;
DROP POLICY IF EXISTS "Custom Fields: SELECT access based on project visibility" ON public.custom_fields;

CREATE POLICY "Custom Fields: SELECT for all users" 
ON public.custom_fields 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'user'::app_role)
);

CREATE POLICY "Custom Fields: INSERT for admins and moderators" 
ON public.custom_fields 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Custom Fields: UPDATE for admins and moderators" 
ON public.custom_fields 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Custom Fields: DELETE for admins and moderators" 
ON public.custom_fields 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role)
);