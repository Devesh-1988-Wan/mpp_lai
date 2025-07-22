export type TaskType = 'task' | 'milestone' | 'deliverable';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select type
  defaultValue?: any;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  startDate: Date;
  endDate: Date;
  dependencies: string[];
  assignee: string;
  progress: number; // 0-100
  customFields?: Record<string, any>; // Custom field values
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_date: string;  // Updated to match database
  last_modified: string; // Updated to match database
  status: 'active' | 'completed' | 'archived';
  tasks?: Task[];
  customFields?: CustomField[];
  team_members: string[]; // Updated to match database
  created_by: string;     // Updated to match database
}