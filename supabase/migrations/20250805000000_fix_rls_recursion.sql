-- supabase/migrations/20250805000000_fix_rls_recursion.sql

-- Drop conflicting policies on child tables that create the loop.
DROP POLICY IF EXISTS "Users can manage tasks based on permissions" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks for accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Super admins and admins have full access to all tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can manage custom fields for projects they created or are admin" ON public.custom_fields;
DROP POLICY IF EXISTS "Users can view custom fields for accessible projects" ON public.custom_fields;
DROP POLICY IF EXISTS "Super admins and admins have full access to all custom fields" ON public.custom_fields;

DROP POLICY IF EXISTS "Users can view permissions for accessible projects" ON public.project_permissions;
DROP POLICY IF EXISTS "Project owners or admins can manage permissions" ON public.project_permissions;

-- Recreate policies for TASKS with direct and non-recursive logic.
CREATE POLICY "Users can view tasks for accessible projects" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND (
        p.created_by = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(p.team_members)) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        EXISTS (
          SELECT 1 FROM public.project_permissions pp
          WHERE pp.project_id = tasks.project_id AND pp.user_email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage tasks based on permissions" ON public.tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND (
        p.created_by = auth.uid() OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        EXISTS (
          SELECT 1 FROM public.project_permissions pp
          WHERE pp.project_id = tasks.project_id
            AND pp.user_email = auth.email()
            AND pp.permission_level IN ('edit', 'admin')
        )
      )
    )
  );

-- Recreate policies for CUSTOM_FIELDS with direct and non-recursive logic.
CREATE POLICY "Users can view custom fields for accessible projects" ON public.custom_fields
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = custom_fields.project_id
      AND (
        p.created_by = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(p.team_members)) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        EXISTS (
          SELECT 1 FROM public.project_permissions pp
          WHERE pp.project_id = custom_fields.project_id AND pp.user_email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage custom fields for projects they own or have admin rights" ON public.custom_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = custom_fields.project_id
      AND (
        p.created_by = auth.uid() OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

-- Recreate policies for PROJECT_PERMISSIONS with direct and non-recursive logic.
CREATE POLICY "Users can view permissions for projects they own or have admin rights" ON public.project_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_permissions.project_id
      AND (
        p.created_by = auth.uid() OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );

CREATE POLICY "Project owners and admins can manage permissions" ON public.project_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_permissions.project_id
      AND (
        p.created_by = auth.uid() OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role)
      )
    )
  );