import { supabase } from '@/lib/supabase';

export interface Integration {
  id: string;
  project_id: string;
  slack_webhook_url?: string;
}

export class IntegrationService {
  static async getIntegration(projectId: string): Promise<Integration | null> {
    // Temporarily disabled - table not in types
    console.warn('Integration service temporarily disabled - table not in types');
    return null;
  }

  static async saveIntegration(projectId: string, integration: Partial<Integration>): Promise<Integration> {
    // Temporarily disabled
    console.warn('Integration service temporarily disabled - table not in types');
    throw new Error('Integration service temporarily disabled');
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