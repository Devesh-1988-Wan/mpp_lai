import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// LocalStorage key for demo projects (to sync with ProjectService)
const DEMO_PROJECTS_KEY = 'lovable-demo-projects';

// Helper functions for localStorage persistence
const loadDemoProjects = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DEMO_PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load demo projects from localStorage:', error);
    return [];
  }
};

const saveDemoProjects = (projects: any[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn('Failed to save demo projects to localStorage:', error);
  }
};

export class TaskService {
  // Get all tasks for a project
  static async getProjectTasks(projectId: string) {
    if (!supabase) {
      // Load from localStorage demo projects
      const demoProjects = loadDemoProjects();
      const project = demoProjects.find(p => p.id === projectId);
      return project?.tasks || [];
    }

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
    if (!supabase) {
      // Handle demo mode
      const demoProjects = loadDemoProjects();
      const projectIndex = demoProjects.findIndex(p => p.id === task.project_id);
      
      if (projectIndex !== -1) {
        const newTask = {
          id: Date.now().toString(),
          name: task.name,
          description: task.description || '',
          type: task.type || task.task_type || 'task',
          status: task.status || 'not-started',
          startDate: new Date(task.start_date || task.startDate),
          endDate: new Date(task.end_date || task.endDate),
          dependencies: task.dependencies || [],
          assignee: task.assignee || '',
          progress: task.progress || 0,
          customFields: task.custom_fields || task.customFields || {}
        };
        
        if (!demoProjects[projectIndex].tasks) {
          demoProjects[projectIndex].tasks = [];
        }
        demoProjects[projectIndex].tasks.push(newTask);
        saveDemoProjects(demoProjects);
        
        return newTask;
      }
      throw new Error('Project not found');
    }

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
  static async updateTask(id: string, updates: any) {
    if (!supabase) {
      // Handle demo mode
      const demoProjects = loadDemoProjects();
      
      for (const project of demoProjects) {
        if (project.tasks) {
          const taskIndex = project.tasks.findIndex((t: any) => t.id === id);
          if (taskIndex !== -1) {
            project.tasks[taskIndex] = { ...project.tasks[taskIndex], ...updates };
            saveDemoProjects(demoProjects);
            return project.tasks[taskIndex];
          }
        }
      }
      throw new Error('Task not found');
    }

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
    if (!supabase) {
      // Handle demo mode
      const demoProjects = loadDemoProjects();
      const projectIndex = demoProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1 && demoProjects[projectIndex].tasks) {
        const taskIndex = demoProjects[projectIndex].tasks.findIndex((t: any) => t.id === id);
        if (taskIndex !== -1) {
          demoProjects[projectIndex].tasks.splice(taskIndex, 1);
          saveDemoProjects(demoProjects);
          return;
        }
      }
      throw new Error('Task not found');
    }

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
    if (!supabase) {
      // Handle demo mode - use updateTask method
      return await this.updateTask(id, { progress });
    }

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
  static async importTasks(tasks: any[]) {
    if (!supabase) {
      // Handle demo mode
      const results = [];
      for (const task of tasks) {
        try {
          const result = await this.createTask(task);
          results.push(result);
        } catch (error) {
          console.warn('Failed to import task:', task.name, error);
        }
      }
      return results;
    }

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
    if (!supabase) {
      // Handle demo mode
      const demoProjects = loadDemoProjects();
      let task: any = null;
      
      for (const project of demoProjects) {
        if (project.tasks) {
          task = project.tasks.find((t: any) => t.id === taskId);
          if (task) break;
        }
      }
      
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        return [];
      }
      
      // Find dependent tasks in the same project
      const project = demoProjects.find(p => p.tasks?.some((t: any) => t.id === taskId));
      if (!project) return [];
      
      return project.tasks.filter((t: any) => task.dependencies.includes(t.id)) || [];
    }

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
}