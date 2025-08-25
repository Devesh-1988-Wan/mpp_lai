export type TaskType = 'task' | 'milestone' | 'deliverable' | 'impacted' | 'contingency'| 'technical-debt';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold'|'dev-in-progress' | 'dev-completed';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';
export type TaskPriority = 'Blocker' | 'Critical' | 'High' | 'Medium' | 'Low';
export type DocsProgressStatus =
  | 'Not Started'
  | 'In Analysis-TA'
  | 'In Progress'
  | 'Ready or Test Cases'
  | 'Handover'
  | 'Not Applicable';

export interface CustomField {
  id: string;
  project_id: string;
  name: string;
  field_type: FieldType;
  required: boolean;
  options?: any;
  default_value?: any;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  developer?: string;
  estimated_days?: number;
  estimated_hours?: number;
  start_date: string;
  end_date: string;
  dependencies: string[];
  assignee?: string;
  progress: number;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  work_item_link?: string;
  priority_code?: string;
  docs_progress?: DocsProgressStatus;
  delivery_date?: string;
  release_version?: string;
  num_resources?: number;
  total_hours_available?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_date: string;
  last_modified: string;
  status: 'active' | 'completed' | 'archived';
  tasks?: Task[];
  customFields?: CustomField[];
  team_members: string[];
  created_by: string;
}