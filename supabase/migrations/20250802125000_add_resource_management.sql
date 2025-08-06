-- 1. Create the resources table
CREATE TABLE resources (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- e.g., 'Human', 'Equipment', 'Material'
    availability JSONB, -- Can store details like hours/week, specific dates
    cost_per_hour NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the resource_allocations table
CREATE TABLE resource_allocations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    allocated_hours NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, resource_id) -- Ensures a resource is allocated only once per task
);

-- 3. Add Row Level Security (RLS) policies
-- Enable RLS for the new tables
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

-- Allow project members to view resources for their projects
CREATE POLICY "Allow members to view resources"
ON resources FOR SELECT
USING ( check_user_is_member(project_id) );

-- Allow project members to manage resources for their projects
CREATE POLICY "Allow members to manage resources"
ON resources FOR ALL
USING ( check_user_is_member(project_id) );

-- Allow project members to view resource allocations for their projects
CREATE POLICY "Allow members to view resource allocations"
ON resource_allocations FOR SELECT
USING ( check_user_is_member((SELECT project_id FROM tasks WHERE id = task_id)) );

-- Allow project members to manage resource allocations for their projects
CREATE POLICY "Allow members to manage resource allocations"
ON resource_allocations FOR ALL
USING ( check_user_is_member((SELECT project_id FROM tasks WHERE id = task_id)) );