-- Grant admin access to a specified user
-- This user should have admin privileges across all projects
-- Replace 'your-admin-email@example.com' with the actual admin email in a secure manner,
-- for example, through environment variables in your deployment pipeline.

-- First, ensure the user has admin role if they don't already
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'dpillewan@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'super-admin'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'devesh.pillewan@amla.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'mukul.chaudhari@amla.io'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'kapil.kimtani@amla.io'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.users.id AND role = 'admin'
);