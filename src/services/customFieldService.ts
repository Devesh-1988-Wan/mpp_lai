import { supabase } from '@/lib/supabase'

type CustomField = {
  id: string;
  project_id: string;
  name: string;
  field_type: string;
  required: boolean;
  default_value?: string;
  options?: any;
  created_at?: string;
}

type CustomFieldInsert = Omit<CustomField, 'id' | 'created_at'>
type CustomFieldUpdate = Partial<CustomFieldInsert>

export class CustomFieldService {
  // Get all custom fields for a project
  static async getProjectCustomFields(projectId: string) {
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  // Create a custom field
  static async createCustomField(field: CustomFieldInsert) {
    const { data, error } = await supabase
      .from('custom_fields')
      .insert([field])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(field.project_id, 'custom_field_created', {
      field_name: data.name,
      field_type: data.field_type
    })

    return data
  }

  // Update a custom field
  static async updateCustomField(id: string, updates: CustomFieldUpdate) {
    const { data, error } = await supabase
      .from('custom_fields')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity(data.project_id, 'custom_field_updated', updates)

    return data
  }

  // Delete a custom field
  static async deleteCustomField(id: string, projectId: string) {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log activity
    await this.logActivity(projectId, 'custom_field_deleted', { field_id: id })
  }

  // Subscribe to custom field changes for a project
  static subscribeToProjectCustomFields(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`custom_fields_${projectId}`)
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
  private static async logActivity(projectId: string, action: string, changes?: any) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('activity_log')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          action,
          changes
        }])
    }
  }
}