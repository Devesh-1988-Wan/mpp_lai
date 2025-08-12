import { supabase } from '@/lib/supabase'
import { TaskPriority } from '@/types/project';

// Define types manually until the auto-generated types are updated
type Task = {
  id: string
  project_id: string
  name: string
  description?: string
  task_type: 'task' | 'milestone' | 'deliverable'
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'impacted' | 'contingency'
  priority: TaskPriority;
  developer?: string;
  estimated_days?: number;
  estimated_hours?: number;
  start_date: string
  end_date: string
  assignee?: string
  progress: number
  dependencies: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
  work_item_link?: string;
  priority_code?: string;
  docs_progress?: 'Not Started' | 'In Analysis-TA' | 'In Progress' | 'Ready or Test Cases' | 'Handover' | 'Not Applicable';
}

type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
type TaskUpdate = Partial<Omit<Task, 'id' | 'project_id' | 'created_at'>>

export class TaskService {
  // Get all tasks for a project
  static async getProjectTasks(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Transform the data to match our application types
    return data?.map(task => ({
      ...task,
      task_type: task.task_type as 'task' | 'milestone' | 'deliverable',
      status: task.status as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'impacted' | 'contingency',
      priority: task.priority as TaskPriority,
      dependencies: Array.isArray(task.dependencies) ? 
        (task.dependencies as any[]).map(dep => String(dep)) : 
        [],
      custom_fields: typeof task.custom_fields === 'object' && task.custom_fields !== null ? 
        task.custom_fields as Record<string, any> : 
        {},
      docs_progress: task.docs_progress as 'Not Started' | 'In Analysis-TA' | 'In Progress' | 'Ready or Test Cases' | 'Handover' | 'Not Applicable' | undefined,
    })) || []
  }

  // Create a new task
  static async createTask(task: any) {
    const taskData: TaskInsert = {
      project_id: task.project_id,
      name: task.name,
      description: task.description || null,
      task_type: task.task_type || 'task',
      status: task.status || 'not-started',
      priority: task.priority || 'Medium',
      developer: task.developer || null,
      estimated_days: task.estimated_days || null,
      estimated_hours: task.estimated_hours || null,
      start_date: task.start_date,
      end_date: task.end_date,
      assignee: task.assignee || null,
      progress: task.progress || 0,
      dependencies: task.dependencies || [],
      custom_fields: task.custom_fields || {},
      work_item_link: task.work_item_link || null,
      priority_code: task.priority_code || null,
      docs_progress: task.docs_progress || 'Not Started',
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    // Transform the returned data to match our application types
    return {
      ...data,
      task_type: data.task_type as 'task' | 'milestone' | 'deliverable',
      status: data.status as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'impacted' | 'contingency',
      priority: data.priority as TaskPriority,
      dependencies: Array.isArray(data.dependencies) ? 
        (data.dependencies as any[]).map(dep => String(dep)) : 
        [],
      custom_fields: typeof data.custom_fields === 'object' && data.custom_fields !== null ? 
        data.custom_fields as Record<string, any> : 
        {},
      docs_progress: data.docs_progress as 'Not Started' | 'In Analysis-TA' | 'In Progress' | 'Ready or Test Cases' | 'Handover' | 'Not Applicable' | undefined
    }
  }

  // Update a task
  static async updateTask(id: string, updates: any) {
    // Sanitize updates to ensure data types are correct
    const sanitizedUpdates = {
      name: updates.name || null,
      description: updates.description || null,
      task_type: updates.task_type || 'task',
      status: updates.status || 'not-started',
      priority: updates.priority || 'Medium',
      developer: updates.developer || null,
      estimated_days: updates.estimated_days !== undefined ? updates.estimated_days : null,
      estimated_hours: updates.estimated_hours !== undefined ? updates.estimated_hours : null,
      start_date: updates.start_date,
      end_date: updates.end_date,
      assignee: updates.assignee || null,
      progress: updates.progress || 0,
      dependencies: updates.dependencies || [],
      custom_fields: updates.custom_fields || {},
      work_item_link: updates.work_item_link || null,
      priority_code: updates.priority_code || null,
      docs_progress: updates.docs_progress || 'Not Started',
      delivery_date: updates.delivery_date || null,
      release_version: updates.release_version || null,
      num_resources: updates.num_resources !== undefined ? updates.num_resources : null,
      total_hours_available: updates.total_hours_available !== undefined ? updates.total_hours_available : null,
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Transform the returned data to match our application types
    return {
      ...data,
      task_type: data.task_type as 'task' | 'milestone' | 'deliverable',
      status: data.status as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'impacted' | 'contingency',
      priority: data.priority as TaskPriority,
      dependencies: Array.isArray(data.dependencies) ? 
        (data.dependencies as any[]).map(dep => String(dep)) : 
        [],
      custom_fields: typeof data.custom_fields === 'object' && data.custom_fields !== null ? 
        data.custom_fields as Record<string, any> : 
        {},
      docs_progress: data.docs_progress as 'Not Started' | 'In Analysis-TA' | 'In Progress' | 'Ready or Test Cases' | 'Handover' | 'Not Applicable' | undefined
    }
  }

  // Delete a task
  static async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}