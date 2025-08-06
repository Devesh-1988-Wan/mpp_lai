import { supabase } from '../integrations/supabase';
import { Resource } from '../types';

export const getResources = async (projectId: string): Promise<Resource[]> => {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
  return data || [];
};

export const addResource = async (resource: Omit<Resource, 'id' | 'created_at'>): Promise<Resource> => {
  const { data, error } = await supabase
    .from('resources')
    .insert([resource])
    .select();

  if (error) {
    console.error('Error adding resource:', error);
    throw error;
  }
  return data[0];
};

export const updateResource = async (id: string, updates: Partial<Resource>): Promise<Resource> => {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
  return data[0];
};

export const deleteResource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};