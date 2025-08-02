-- Set dpillewan@gmail.com as super admin
INSERT INTO user_roles (user_id, role) 
SELECT id, 'super_admin' 
FROM auth.users 
WHERE email = 'dpillewan@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the handle_new_user function to assign admin role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  
  -- Assign 'admin' role to all new users by default (instead of 'user')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$function$;

-- Drop existing policies and recreate with proper super admin and admin access
DROP POLICY IF EXISTS "Super admins have full access to all projects" ON projects;
DROP POLICY IF EXISTS "Super admins have full access to all tasks" ON tasks;
DROP POLICY IF EXISTS "Super admins have full access to all custom fields" ON custom_fields;

-- Create comprehensive policies for super admin and admin access
CREATE POLICY "Super admins and admins have full access to all projects"
ON projects FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  created_by = auth.uid() OR
  (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
  (EXISTS (
    SELECT 1 FROM project_permissions
    WHERE project_permissions.project_id = projects.id
    AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  created_by = auth.uid() OR
  (auth.uid()::text IN (SELECT jsonb_array_elements_text(team_members))) OR
  (EXISTS (
    SELECT 1 FROM project_permissions
    WHERE project_permissions.project_id = projects.id
    AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND permission_level IN ('edit', 'admin')
  ))
);

CREATE POLICY "Super admins and admins have full access to all tasks"
ON tasks FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND (
      projects.created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(projects.team_members))) OR
      (EXISTS (
        SELECT 1 FROM project_permissions
        WHERE project_permissions.project_id = projects.id
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      ))
    )
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND (
      projects.created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(projects.team_members))) OR
      (EXISTS (
        SELECT 1 FROM project_permissions
        WHERE project_permissions.project_id = projects.id
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND permission_level IN ('edit', 'admin')
      ))
    )
  ))
);

CREATE POLICY "Super admins and admins have full access to all custom fields"
ON custom_fields FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = custom_fields.project_id
    AND (
      projects.created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(projects.team_members))) OR
      (EXISTS (
        SELECT 1 FROM project_permissions
        WHERE project_permissions.project_id = projects.id
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      ))
    )
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'admin') OR
  (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = custom_fields.project_id
    AND (
      projects.created_by = auth.uid() OR
      (auth.uid()::text IN (SELECT jsonb_array_elements_text(projects.team_members))) OR
      (EXISTS (
        SELECT 1 FROM project_permissions
        WHERE project_permissions.project_id = projects.id
        AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND permission_level IN ('edit', 'admin')
      ))
    )
  ))
);

-- Policy for moderators to have view access to projects they have permissions for
CREATE POLICY "Moderators have view access to assigned projects"
ON projects FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'moderator') AND
  (EXISTS (
    SELECT 1 FROM project_permissions
    WHERE project_permissions.project_id = projects.id
    AND project_permissions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND permission_level = 'view'
  ))
);