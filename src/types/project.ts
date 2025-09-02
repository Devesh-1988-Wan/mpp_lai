export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  milestone?: boolean;
  assignees?: string[];
  priority?: 'High' | 'Medium' | 'Low';
}

export interface Resource {
    id: string;
    name: string;
    type: 'Human' | 'Equipment' | 'Material';
    availability: number; // e.g., hours per week or quantity
    cost: number; // e.g., per hour or per unit
}

export interface BudgetItem {
    id: string;
    name: string;
    type: 'Income' | 'Expense';
    amount: number;
    date: string;
}

export interface Integration {
    id: string;
    platform: 'Jira' | 'Asana' | 'Trello' | 'Slack';
    apiKey: string;
    projectUrl: string;
}

export interface CustomField {
    id: string;
    name: string;
    type: 'Text' | 'Number' | 'Date' | 'Boolean';
    value: any;
}

export interface CapacityData {
  id: string;
  team_member: string;
  days_worked: number;
  man_hours: number;
  capacity_80_percent: number;
  total_team_capacity?: number;
  estimated_usage?: number;
  remaining_capacity?: number;
  created_at?: string;
  updated_at?: string;
}