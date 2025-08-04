import { supabase } from '@/lib/supabase';

export interface Resource {
  id: string;
  project_id: string;
  name: string;
  type: string;
  availability: number;
}

export class ResourceService {
  static async getResourcesForProject(projectId: string): Promise<Resource[]> {
    // Temporarily disabled - table not in types
    console.warn('Resource service temporarily disabled - table not in types');
    return [];
  }

  static async createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    // Temporarily disabled
    console.warn('Resource service temporarily disabled - table not in types');
    throw new Error('Resource service temporarily disabled');
  }

  static async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    // Temporarily disabled
    console.warn('Resource service temporarily disabled - table not in types');
    throw new Error('Resource service temporarily disabled');
  }

  static async deleteResource(id: string): Promise<void> {
    // Temporarily disabled
    console.warn('Resource service temporarily disabled - table not in types');
    throw new Error('Resource service temporarily disabled');
  }
}