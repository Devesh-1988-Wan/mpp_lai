import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { Task } from '@/types/project';

interface JiraIntegrationProps {
  tasks: Task[];
  onSyncTask: (taskId: string, jiraKey: string) => void;
}

export function JiraIntegration({ tasks, onSyncTask }: JiraIntegrationProps) {
  const [jiraUrl, setJiraUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (jiraUrl && apiToken) {
      setIsConnected(true);
    }
  };

  const syncTaskToJira = (task: Task) => {
    // Simulate sync
    const jiraKey = `PROJ-${Math.floor(Math.random() * 1000)}`;
    onSyncTask(task.id, jiraKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ExternalLink className="w-5 h-5" />
          <span>Jira Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jira-url">Jira URL</Label>
              <Input
                id="jira-url"
                value={jiraUrl}
                onChange={(e) => setJiraUrl(e.target.value)}
                placeholder="https://yourcompany.atlassian.net"
              />
            </div>
            <div>
              <Label htmlFor="api-token">API Token</Label>
              <Input
                id="api-token"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Jira API token"
              />
            </div>
            <Button onClick={handleConnect} disabled={!jiraUrl || !apiToken}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect to Jira
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected to Jira
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setIsConnected(false)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Sync Tasks</h4>
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground">{task.status}</p>
                  </div>
                  <Button size="sm" onClick={() => syncTaskToJira(task)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}