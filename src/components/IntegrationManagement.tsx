import React, { useState, useEffect } from 'react';
import { getIntegrations, saveIntegration } from '../services/integrationService';
import { Integration } from '../types/project'; // Corrected import path

interface Props {
  projectId: string;
}

const IntegrationManagement: React.FC<Props> = ({ projectId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [slackWebhook, setSlackWebhook] = useState('');

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const integrations = await getIntegrations(projectId);
        setIntegrations(integrations);
        const slackIntegration = integrations.find(i => i.service === 'slack');
        if (slackIntegration && slackIntegration.credentials && typeof slackIntegration.credentials === 'object' && 'webhook_url' in slackIntegration.credentials) {
            setSlackWebhook((slackIntegration.credentials as { webhook_url: string }).webhook_url);
        }
      } catch (error) {
        console.error("Failed to fetch integrations", error);
      }
    };
    fetchIntegrations();
  }, [projectId]);

  const handleSaveSlack = async () => {
    try {
      const existingIntegration = integrations.find(i => i.service === 'slack');
      await saveIntegration({
        id: existingIntegration?.id,
        project_id: projectId,
        service: 'slack',
        credentials: { webhook_url: slackWebhook },
      });
      alert('Slack integration saved!');
    } catch (error) {
      console.error("Failed to save Slack integration", error);
      alert('Failed to save Slack integration.');
    }
  };

  return (
    <div>
      <h2>Integration Management</h2>
      <div>
        <h3>Slack</h3>
        <input
          type="text"
          value={slackWebhook}
          onChange={(e) => setSlackWebhook(e.target.value)}
          placeholder="Slack Webhook URL"
        />
        <button onClick={handleSaveSlack}>Save</button>
      </div>
    </div>
  );
};

export default IntegrationManagement;
