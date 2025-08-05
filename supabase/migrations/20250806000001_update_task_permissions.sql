-- Update RLS policy for tasks table to allow admins and super admins to update new fields
DROP POLICY IF EXISTS "Tasks: UPDATE for admins and moderators" ON public.tasks;

CREATE POLICY "Tasks: UPDATE for admins and super admins"
ON public.tasks
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);