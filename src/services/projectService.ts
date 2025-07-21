import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// In-memory storage for demo projects when Supabase is not configured
let demoProjects: any[] = [];
export class ProjectService {
  // Get all projects for the current user
  static async getUserProjects() {
    if (!supabase) {
      // Initialize with sample data if empty
      if (demoProjects.length === 0) {
        demoProjects = [
          {
            id: '1',
            name: 'Sample Project',
            description: 'This is a sample project. Connect Supabase to store real data.',
            status: 'active' as const,
            createdDate: new Date('2024-01-01'),
            lastModified: new Date(),
            teamMembers: ['Demo User']
          }
        ];
      }
      return demoProjects;
    }

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
    if (!supabase) {
      // Look for project in demo storage
      let project = demoProjects.find(p => p.id === id);
      
      if (!project) {
        // If not found and it's the sample project ID, create it
        if (id === '1') {
          project = {
            id: '1',
            name: 'Sample Software Project',
            description: 'A comprehensive software development project with multiple phases',
            createdDate: new Date('2024-01-01'),
            lastModified: new Date(),
            status: 'active' as const,
            customFields: [
              {
                id: 'cf1',
                name: 'Priority',
                type: 'select' as const,
                required: true,
                options: ['Low', 'Medium', 'High', 'Critical']
              }
            ],
            teamMembers: ['Sarah Johnson', 'Alex Chen'],
            tasks: [
              {
                id: '1',
                name: 'Project Planning & Requirements',
                description: 'Define project scope and gather requirements',
                type: 'task' as const,
                status: 'completed' as const,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
                dependencies: [],
                assignee: 'Sarah Johnson',
                progress: 100,
                customFields: { 'cf1': 'High' }
              }
            ]
          };
          demoProjects.push(project);
        }
      }
      
      return project || null;
    }

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
    if (!supabase) {
      // Create mock project and add to demo storage
      const mockProject = {
        id: Date.now().toString(),
        name: project.name,
        description: project.description || '',
        status: project.status || 'active' as const,
        createdDate: new Date(),
        lastModified: new Date(),
        teamMembers: project.team_members || [],
        tasks: [],
        customFields: []
      };
      
      // Add to demo storage
      demoProjects.push(mockProject);
      
      return mockProject;
    }

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
    if (!supabase) return; // Skip logging when Supabase is not configured
    
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