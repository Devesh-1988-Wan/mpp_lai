import { supabase } from '@/lib/supabase';

export interface Integration {
  id: string;
  project_id: string;
  slack_webhook_url?: string;
}

export class IntegrationService {
  static async getIntegration(projectId: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async saveSlackWebhookUrl(projectId: string, webhookUrl: string): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .upsert({ 
        project_id: projectId, 
        slack_webhook_url: webhookUrl 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveIntegration(projectId: string, integration: Partial<Integration>): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .upsert({ 
        project_id: projectId, 
        ...integration 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async sendSlackNotification(webhookUrl: string, message: string): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }
}