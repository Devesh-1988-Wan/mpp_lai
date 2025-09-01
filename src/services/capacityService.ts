import { supabase } from '../lib/supabase';
import { CapacityData } from '../types/project';

export const getCapacityData = async (): Promise<CapacityData[]> => {
  const { data, error } = await supabase.from('capacity_summary').select('*');
  if (error) {
    console.error('Error fetching capacity data:', error);
    throw error;
  }
  return data || [];
};

export const addCapacityData = async (capacityEntry: Omit<CapacityData, 'id' | 'created_at' | 'updated_at'>): Promise<CapacityData | null> => {
  const { data, error } = await supabase.from('capacity_summary').insert([capacityEntry]).select();
  if (error) {
    console.error('Error adding capacity data:', error);
    throw error;
  }
  return data ? data[0] : null;
};

export const updateCapacityData = async (id: string, updates: Partial<CapacityData>): Promise<CapacityData | null> => {
  const { data, error } = await supabase.from('capacity_summary').update(updates).eq('id', id).select();
  if (error) {
    console.error('Error updating capacity data:', error);
    throw error;
  }
  return data ? data[0] : null;
};

export const deleteCapacityData = async (id: string) => {
    const { error } = await supabase.from('capacity_summary').delete().eq('id', id);
    if (error) {
        console.error('Error deleting capacity data:', error);
        throw error;
    }
};
