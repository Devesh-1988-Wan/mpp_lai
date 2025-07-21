import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

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
  static async createTask(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(task.project_id, 'task_created', {
      task_name: data.name,
      task_type: data.task_type
    }, data.id)

    return data
  }

  // Update a task
  static async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(data.project_id, 'task_updated', updates, id)

    return data
  }

  // Delete a task
  static async deleteTask(id: string, projectId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log activity
    await this.logActivity(projectId, 'task_deleted', { task_id: id }, id)
  }

  // Update task progress
  static async updateTaskProgress(id: string, progress: number) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ progress })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Auto-update status based on progress
    let status = data.status
    if (progress === 0) {
      status = 'not-started'
    } else if (progress === 100) {
      status = 'completed'
    } else if (status === 'not-started' || status === 'completed') {
      status = 'in-progress'
    }

    if (status !== data.status) {
      return await this.updateTask(id, { status })
    }

    return data
  }

  // Bulk import tasks
  static async importTasks(tasks: TaskInsert[]) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasks)
      .select()

    if (error) throw error

    // Log bulk import activity
    if (tasks.length > 0) {
      await this.logActivity(tasks[0].project_id, 'tasks_imported', {
        count: tasks.length,
        task_names: data.map(t => t.name)
      })
    }

    return data
  }

  // Get task dependencies
  static async getTaskDependencies(taskId: string) {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('dependencies, project_id')
      .eq('id', taskId)
      .single()

    if (error) throw error

    if (!task.dependencies || task.dependencies.length === 0) {
      return []
    }

    const { data: dependencies, error: depsError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', task.project_id)
      .in('id', task.dependencies)

    if (depsError) throw depsError
    return dependencies
  }

  // Check if task can be started (all dependencies completed)
  static async canStartTask(taskId: string): Promise<boolean> {
    const dependencies = await this.getTaskDependencies(taskId)
    return dependencies.every(dep => dep.status === 'completed')
  }

  // Subscribe to task changes for a project
  static subscribeToProjectTasks(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tasks_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe()
  }

  // Log activity for audit trail
  private static async logActivity(projectId: string, action: string, changes?: any, taskId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('activity_log')
        .insert([{
          project_id: projectId,
          task_id: taskId || null,
          user_id: user.id,
          action,
          changes
        }])
    }
  }
}