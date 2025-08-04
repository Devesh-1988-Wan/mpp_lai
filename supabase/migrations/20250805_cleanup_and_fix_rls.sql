-- Drop all existing policies on projects, tasks, and custom_fields to ensure a clean slate.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.projects;';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tasks') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.tasks;';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'custom_fields') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.custom_fields;';
    END LOOP;
END $$;

-- === PROJECTS TABLE POLICIES ===

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their accessible projects" ON public.projects
  FOR SELECT USING (
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

CREATE POLICY "Project owners, admins, and editors can update projects" ON public.projects
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_permissions
      WHERE project_permissions.project_id = projects.id
      AND project_permissions.user_email = auth.email()
      AND permission_level IN ('edit', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can delete projects" ON public.projects
  FOR DELETE USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid()
  );


-- === TASKS TABLE POLICIES ===

CREATE POLICY "Users can view tasks for accessible projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND (
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        p.created_by = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(p.team_members)) OR
        EXISTS (
          SELECT 1 FROM project_permissions pp
          WHERE pp.project_id = p.id
          AND pp.user_email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users with edit permissions can manage tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND (
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        p.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_permissions pp
          WHERE pp.project_id = p.id
          AND pp.user_email = auth.email()
          AND pp.permission_level IN ('edit', 'admin')
        )
      )
    )
  );


-- === CUSTOM FIELDS TABLE POLICIES ===

CREATE POLICY "Users can view custom fields for accessible projects" ON custom_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_fields.project_id
    )
  );

CREATE POLICY "Users with edit permissions can manage custom fields" ON custom_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = custom_fields.project_id
      AND (
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'super_admin'::app_role) OR
        p.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_permissions pp
          WHERE pp.project_id = p.id
          AND pp.user_email = auth.email()
          AND pp.permission_level IN ('edit', 'admin')
        )
      )
    )
  );