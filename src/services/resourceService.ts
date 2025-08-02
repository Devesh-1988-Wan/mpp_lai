// src/services/resourceService.ts
import { supabase } from '@/lib/supabase';

export interface Resource {
  id: string;
  project_id: string;
  name: string;
  type: 'human' | 'equipment' | 'material';
  availability: number;
}

export class ResourceService {
  static async getResourcesForProject(projectId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  }

  static async createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteResource(id: string): Promise<void> {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
  }
}