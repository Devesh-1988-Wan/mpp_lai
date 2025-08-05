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

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('last_modified', { ascending: false });

    if (error) throw error
    
    return data?.map(project => ({
      ...project,
      status: project.status as 'active' | 'completed' | 'archived',
      team_members: Array.isArray(project.team_members) ? 
        (project.team_members as any[]).map(member => String(member)) : 
        []
    })) || []
  }

  // Get a specific project by ID with embedded custom fields
  static async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, custom_fields(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    
    return {
      ...data,
      status: data.status as 'active' | 'completed' | 'archived',
      team_members: Array.isArray(data.team_members) ? 
        (data.team_members as any[]).map(member => String(member)) : 
        [],
      customFields: data.custom_fields?.map(field => ({
        ...field,
        field_type: field.field_type as 'text' | 'number' | 'date' | 'select' | 'boolean',
        options: field.options as any,
        default_value: field.default_value as any
      })) || []
    }
  }

  // Create a new project
  static async createProject(project: ProjectInsert) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Destructure to remove fields that are not in the 'projects' table
    const { tasks, customFields, ...projectData } = project as any;

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update a project
  static async updateProject(id: string, updates: any) {
    // Destructure to remove fields that are not in the 'projects' table
    const { tasks, customFields, ...projectData } = updates;

    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
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