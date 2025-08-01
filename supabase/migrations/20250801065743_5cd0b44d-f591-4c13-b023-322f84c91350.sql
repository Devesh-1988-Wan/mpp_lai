-- Grant admin access to devesh.pillewan@amla.io
-- This user should have admin privileges across all projects

-- First, ensure the user has admin role if they don't already
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'devesh.pillewan@amla.io'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);