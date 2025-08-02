// src/components/IntegrationManagement.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Integration, IntegrationService } from '@/services/integrationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationManagementProps {
  projectId: string;
}

export const IntegrationManagement: React.FC<IntegrationManagementProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [slackUrl, setSlackUrl] = useState('');

  const { data: integration, isLoading } = useQuery<Integration | null>({
    queryKey: ['integration', projectId],
    queryFn: () => IntegrationService.getIntegration(projectId),
  });

  useEffect(() => {
    if (integration?.slack_webhook_url) {
      setSlackUrl(integration.slack_webhook_url);
    }
  }, [integration]);

  const saveSlackUrlMutation = useMutation({
    mutationFn: (url: string) => IntegrationService.saveSlackWebhookUrl(projectId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration', projectId] });
      toast({ title: 'Slack webhook URL saved!' });
    },
    onError: () => {
      toast({ title: 'Failed to save Slack webhook URL', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    saveSlackUrlMutation.mutate(slackUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect with other services like Slack.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label htmlFor="slack-url" className="font-medium">Slack Webhook URL</label>
          <div className="flex gap-2">
            <Input
              id="slack-url"
              placeholder="https://hooks.slack.com/services/..."
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
            />
            <Button onClick={handleSave} disabled={saveSlackUrlMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};