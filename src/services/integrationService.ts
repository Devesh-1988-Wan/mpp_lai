import { supabase } from '../lib/supabase';
import { Integration } from '../types/project';

/**
 * Fetches all integrations for a given project.
 * @param projectId The ID of the project.
 * @returns A promise that resolves to an array of integrations.
 */
export const getIntegrations = async (projectId: string): Promise<Integration[]> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching integrations:', error);
    throw error;
  }
  return data || [];
};

/**
 * Saves an integration, either creating it if it doesn't exist or updating it if it does.
 * It uses the unique constraint on (project_id, service) to determine the action.
 * @param integration The integration data to save. Can be a partial object for an update.
 * @returns A promise that resolves to the saved integration data.
 */
export const saveIntegration = async (integration: Partial<Integration>) => {
    const { data, error } = await supabase
        .from('integrations')
        .upsert(integration, { onConflict: 'project_id, service' })
        .select();

    if (error) {
        console.error('Error saving integration', error);
        throw error;
    }
    
    if (data) {
        return data[0];
    }

    throw new Error('Could not save integration');
};
