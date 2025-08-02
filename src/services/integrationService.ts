// src/services/integrationService.ts
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
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116: no rows found
    return data;
  }

  static async saveSlackWebhookUrl(projectId: string, url: string): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .upsert({ project_id: projectId, slack_webhook_url: url }, { onConflict: 'project_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async sendSlackNotification(webhookUrl: string, message: string) {
    const { data, error } = await supabase.functions.invoke('slack-notifier', {
      body: { webhookUrl, message },
    });

    if (error) throw error;
    return data;
  }
}