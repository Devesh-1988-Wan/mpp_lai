-- supabase/migrations/20250808125100_add_budgeting.sql

-- 0. Create helper function to check project membership
CREATE OR REPLACE FUNCTION check_user_is_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_users
    WHERE project_id = p_project_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Create the budgets table
CREATE TABLE budgets (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE, -- One budget per project
    total_budget NUMERIC NOT NULL CHECK (total_budget >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the budget_items table for individual transactions
CREATE TABLE budget_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT, -- e.g., 'Labor', 'Materials', 'Software'
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Row Level Security (RLS) policies
-- Enable RLS for the new tables
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Allow project members to view budgets for their projects
CREATE POLICY "Allow members to view budgets"
ON budgets FOR SELECT
USING ( check_user_is_member(project_id) );

-- Allow project members to manage budgets for their projects
CREATE POLICY "Allow members to manage budgets"
ON budgets FOR ALL
USING ( check_user_is_member(project_id) );

-- Allow project members to view budget items for their projects
CREATE POLICY "Allow members to view budget items"
ON budget_items FOR SELECT
USING ( check_user_is_member((SELECT project_id FROM budgets WHERE id = budget_id)) );

-- Allow project members to manage budget items for their projects
CREATE POLICY "Allow members to manage budget items"
ON budget_items FOR ALL
USING ( check_user_is_member((SELECT project_id FROM budgets WHERE id = budget_id)) );
