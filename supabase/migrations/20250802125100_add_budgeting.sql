-- Drop the old policies first
DROP POLICY "Allow members to manage budgets" ON public.budgets;
DROP POLICY "Allow members to view budget items" ON public.budget_items;

-- Create new policies that include the admin role
CREATE POLICY "Allow members and admins to manage budgets"
ON public.budgets FOR ALL
USING (
  check_user_is_member(project_id) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Allow members and admins to manage budget items"
ON public.budget_items FOR ALL
USING (
  (SELECT check_user_is_member(project_id) FROM budgets WHERE id = budget_id) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add policy for expenses table
CREATE POLICY "Allow members and admins to manage expenses"
ON public.expenses FOR ALL
USING (
  check_user_is_member(project_id) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);