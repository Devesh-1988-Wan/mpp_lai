import { supabase } from '@/lib/supabase'

// Define types manually until the auto-generated types are updated
type Task = {
  id: string
  project_id: string
  name: string
  description?: string
  task_type: 'task' | 'milestone' | 'deliverable'
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'
  start_date: string
  end_date: string
  assignee?: string
  progress: number
  dependencies: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
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
    return data
  }

  // Create a new task
  static async createTask(task: any) {
    const taskData: TaskInsert = {
      project_id: task.project_id,
      name: task.name,
      description: task.description || null,
      task_type: task.task_type || 'task',
      status: task.status || 'not-started',
      start_date: task.start_date,
      end_date: task.end_date,
      assignee: task.assignee || null,
      progress: task.progress || 0,
      dependencies: task.dependencies || [],
      custom_fields: task.custom_fields || {}
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
    return data
  }

  // Update a task
  static async updateTask(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
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