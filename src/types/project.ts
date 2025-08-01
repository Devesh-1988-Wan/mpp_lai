export type TaskType = 'task' | 'milestone' | 'deliverable';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

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
  start_date: string;
  end_date: string;
  dependencies: string[];
  assignee?: string;
  progress: number;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
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