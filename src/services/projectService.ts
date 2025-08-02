import { supabase } from '@/lib/supabase'

// Define types manually until the auto-generated types are updated
type Project = {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_date: string
  last_modified: string
  created_by: string
  team_members: string[]
}

type ProjectInsert = Omit<Project, 'id' | 'created_date' | 'last_modified' | 'created_by'>
type ProjectUpdate = Partial<Omit<Project, 'id' | 'created_date' | 'created_by'>>

export class ProjectService {
  // Get all projects for the current user
  static async getUserProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const query = supabase
      .from('projects')
      .select(`
        *,
        tasks(count),
        custom_fields(*)
      `);

    const { data, error } = await query.order('last_modified', { ascending: false });

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...project,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update a project
  static async updateProject(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a project
  static async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}