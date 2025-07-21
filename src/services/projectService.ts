import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export class ProjectService {
  // Get all projects for the current user
  static async getUserProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks(count),
        custom_fields(*)
      `)
      .order('last_modified', { ascending: false })

    if (error) throw error
    return data
  }

  // Get a specific project by ID
  static async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks(*),
        custom_fields(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create a new project
  static async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(data.id, 'project_created', {
      project_name: data.name
    })

    return data
  }

  // Update a project
  static async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(id, 'project_updated', updates)

    return data
  }

  // Delete a project
  static async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log activity
    await this.logActivity(id, 'project_deleted', { project_id: id })
  }

  // Subscribe to project changes
  static subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        callback
      )
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_fields',
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

  // Get project activity log
  static async getProjectActivity(projectId: string) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  }
}