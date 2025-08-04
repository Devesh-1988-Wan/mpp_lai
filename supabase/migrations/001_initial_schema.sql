-- Create enum for user roles only if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END$$;

-- Create profiles table for additional user information
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          display_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END$$;

-- Create user_roles table for role management
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        CREATE TABLE public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          role app_role NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (user_id, role)
        );
    END IF;
END$$;

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );

  -- Set default role as 'user' for all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;
-- Trigger to automatically create profile and assign role on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create projects table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        CREATE TABLE projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
          created_date TIMESTAMPTZ DEFAULT NOW(),
          last_modified TIMESTAMPTZ DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id),
          team_members JSONB DEFAULT '[]'::jsonb
        );
    END IF;
END$$;

-- Create custom_fields table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'custom_fields') THEN
        CREATE TABLE custom_fields (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          field_type TEXT CHECK (field_type IN ('text', 'number', 'date', 'select', 'boolean')) NOT NULL,
          required BOOLEAN DEFAULT false,
          options JSONB,
          default_value TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END$$;

-- Create tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        CREATE TABLE tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          task_type TEXT CHECK (task_type IN ('task', 'milestone', 'deliverable')) DEFAULT 'task',
          status TEXT CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold')) DEFAULT 'not-started',
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          assignee TEXT,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          dependencies JSONB DEFAULT '[]'::jsonb,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END$$;

-- Create activity_log table for tracking changes
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_log') THEN
        CREATE TABLE activity_log (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          action TEXT NOT NULL,
          changes JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END$$;

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
DROP POLICY IF EXISTS "Users can view projects they are part of or if they are admin" ON projects;
CREATE POLICY "Users can view projects they are part of or if they are admin" ON projects
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    created_by = auth.uid() OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members))
  );

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update projects they created or if they are admin" ON projects;
CREATE POLICY "Users can update projects they created or if they are admin" ON projects
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete projects they created or if they are admin" ON projects;
CREATE POLICY "Users can delete projects they created or if they are admin" ON projects
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') OR
    created_by = auth.uid()
  );

-- RLS Policies for custom_fields
DROP POLICY IF EXISTS "Users can view custom fields for accessible projects" ON custom_fields;
CREATE POLICY "Users can view custom fields for accessible projects" ON custom_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_fields.project_id
    )
  );

DROP POLICY IF EXISTS "Users can manage custom fields for projects they created or are admin" ON custom_fields;
CREATE POLICY "Users can manage custom fields for projects they created or are admin" ON custom_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_fields.project_id
      AND (
        projects.created_by = auth.uid() OR
        public.has_role(auth.uid(), 'admin')
      )
    )
  );

-- RLS Policies for tasks
DROP POLICY IF EXISTS "Users can view tasks for accessible projects" ON tasks;
CREATE POLICY "Users can view tasks for accessible projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
    )
  );

DROP POLICY IF EXISTS "Users can manage tasks for accessible projects" ON tasks;
CREATE POLICY "Users can manage tasks for accessible projects" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
    )
  );

-- RLS Policies for activity_log
DROP POLICY IF EXISTS "Users can view activity for accessible projects" ON activity_log;
CREATE POLICY "Users can view activity for accessible projects" ON activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_log.project_id
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON activity_log;
CREATE POLICY "Users can create activity logs" ON activity_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_project_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET last_modified = NOW() WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_on_task_change ON tasks;
CREATE TRIGGER update_project_on_task_change AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE update_project_last_modified();

-- Enable realtime for live updates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'projects') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'custom_fields') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE custom_fields;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'activity_log') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
  END IF;
END $$;