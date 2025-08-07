-- Phase 1: Critical Security Fixes

-- 1. Enable RLS on projects table (CRITICAL FIX)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Fix search path vulnerabilities in database functions (15 functions)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_project(project_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id_to_check
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'super_admin') OR
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_permissions
        WHERE project_permissions.project_id = project_id_to_check
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND project_permissions.permission_level IN ('edit', 'admin')
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_project(project_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id_to_check
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'super_admin') OR
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_permissions
        WHERE project_permissions.project_id = project_id_to_check
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_projects()
RETURNS SETOF projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM projects
  WHERE
    -- User is the creator
    created_by = auth.uid() OR
    -- User has admin or super_admin role
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    -- User is a team member
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(team_members) AS member
      WHERE member = auth.uid()::text
    ) OR
    -- User has permissions via project_permissions table
    EXISTS (
      SELECT 1
      FROM project_permissions
      WHERE project_permissions.project_id = projects.id
      AND project_permissions.user_email = auth.email()
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.check_user_project_permission(p_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_permitted BOOLEAN;
BEGIN
  -- Check if a permission row exists for the given project_id and the current user's email
  SELECT EXISTS (
    SELECT 1
    FROM public.project_permissions
    WHERE project_id = p_project_id AND user_email = auth.email()
  ) INTO is_permitted;
  
  RETURN is_permitted;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_is_member(p_project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM projects
    WHERE id = p_project_id 
    AND (
      created_by = auth.uid() OR
      (auth.uid()::text IN (
        SELECT jsonb_array_elements_text(team_members)
      )) OR
      EXISTS (
        SELECT 1 FROM project_permissions 
        WHERE project_id = p_project_id 
        AND user_email = auth.email()
      )
    )
  );
END;
$$;

-- Fix remaining functions with search_path
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only set updated_at on UPDATE operations, not INSERT
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_project_last_modified()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  UPDATE projects SET last_modified = NOW() WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_last_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.last_modified = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.safe_update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only update timestamp on UPDATE operations, not INSERT
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- For INSERT, just return NEW without modification
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Fix user role assignment (change default from 'admin' to 'user')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  
  -- Assign 'user' role by default (SECURITY FIX: was 'admin')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Phase 2: Clean up and create comprehensive RLS policies

-- Drop all existing conflicting RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Project permissions: SELECT for project owners and admins" ON public.project_permissions;
DROP POLICY IF EXISTS "Project permissions: INSERT for project owners and admins" ON public.project_permissions;
DROP POLICY IF EXISTS "Project permissions: UPDATE for project owners and admins" ON public.project_permissions;
DROP POLICY IF EXISTS "Project permissions: DELETE for project owners and admins" ON public.project_permissions;
DROP POLICY IF EXISTS "Users can view permissions for projects they own or have admin" ON public.project_permissions;

-- PROJECTS TABLE: Comprehensive RLS policies
CREATE POLICY "Projects: Super admin and admin full access"
ON public.projects FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Projects: Owner full access"
ON public.projects FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Projects: Team members and permitted users view access"
ON public.projects FOR SELECT
TO authenticated
USING (
  (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
  EXISTS (
    SELECT 1 FROM project_permissions 
    WHERE project_id = projects.id 
    AND user_email = auth.email()
  )
);

CREATE POLICY "Projects: Moderators can edit accessible projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'moderator') AND (
    created_by = auth.uid() OR
    (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
    EXISTS (
      SELECT 1 FROM project_permissions 
      WHERE project_id = projects.id 
      AND user_email = auth.email()
      AND permission_level IN ('edit', 'admin')
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'moderator') AND (
    created_by = auth.uid() OR
    (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
    EXISTS (
      SELECT 1 FROM project_permissions 
      WHERE project_id = projects.id 
      AND user_email = auth.email()
      AND permission_level IN ('edit', 'admin')
    )
  )
);

CREATE POLICY "Projects: Users can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- PROJECT_PERMISSIONS TABLE: Clean policies
CREATE POLICY "Project permissions: Admin and super admin full access"
ON public.project_permissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Project permissions: Project owners can manage"
ON public.project_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_permissions.project_id 
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_permissions.project_id 
    AND created_by = auth.uid()
  )
);

-- Clean up redundant task policies and create standardized ones
DROP POLICY IF EXISTS "Tasks: DELETE for admins and moderators" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: INSERT for admins and moderators" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: SELECT for all users with project access" ON public.tasks;
DROP POLICY IF EXISTS "Tasks: UPDATE for admins and super admins" ON public.tasks;

CREATE POLICY "Tasks: Super admin and admin full access"
ON public.tasks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Tasks: Accessible project members can view"
ON public.tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = tasks.project_id 
    AND (
      created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
      EXISTS (
        SELECT 1 FROM project_permissions 
        WHERE project_id = projects.id 
        AND user_email = auth.email()
      )
    )
  )
);

CREATE POLICY "Tasks: Moderators and users can manage in accessible projects"
ON public.tasks FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'user')) AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = tasks.project_id 
    AND (
      created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
      EXISTS (
        SELECT 1 FROM project_permissions 
        WHERE project_id = projects.id 
        AND user_email = auth.email()
        AND permission_level IN ('edit', 'admin')
      )
    )
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'user')) AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = tasks.project_id 
    AND (
      created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
      EXISTS (
        SELECT 1 FROM project_permissions 
        WHERE project_id = projects.id 
        AND user_email = auth.email()
        AND permission_level IN ('edit', 'admin')
      )
    )
  )
);