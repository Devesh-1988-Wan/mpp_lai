import React, { useState, useEffect } from 'react';
import { getIntegrations, saveIntegration } from '../services/integrationService';
import { Integration } from '../types';

interface Props {
  projectId: string;
}

const IntegrationManagement: React.FC<Props> = ({ projectId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [slackWebhook, setSlackWebhook] = useState('');

  useEffect(() => {
    const fetchIntegrations = async () => {
      const integrations = await getIntegrations(projectId);
      setIntegrations(integrations);
      const slackIntegration = integrations.find(i => i.service === 'slack');
      if (slackIntegration) {
        setSlackWebhook(slackIntegration.credentials.webhook_url);
      }
    };
    fetchIntegrations();
  }, [projectId]);

  const handleSaveSlack = async () => {
    await saveIntegration({
      project_id: projectId,
      service: 'slack',
      credentials: { webhook_url: slackWebhook },
    });
    alert('Slack integration saved!');
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