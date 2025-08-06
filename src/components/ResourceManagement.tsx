import React, { useState, useEffect } from 'react';
import { getResources, addResource, updateResource, deleteResource } from '../services/resourceService';
import { Resource } from '../types';

interface Props {
  projectId: string;
}

const ResourceManagement: React.FC<Props> = ({ projectId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      const resources = await getResources(projectId);
      setResources(resources);
    };
    fetchResources();
  }, [projectId]);

  const handleAddResource = async () => {
    if (newResourceName && newResourceType) {
      const newResource = await addResource({
        project_id: projectId,
        name: newResourceName,
        type: newResourceType,
      });
      setResources([...resources, newResource]);
      setNewResourceName('');
      setNewResourceType('');
    }
  };

  const handleDeleteResource = async (id: string) => {
    await deleteResource(id);
    setResources(resources.filter(r => r.id !== id));
  };

  return (
    <div>
      <h2>Resource Management</h2>
      <ul>
        {resources.map(resource => (
          <li key={resource.id}>
            {resource.name} ({resource.type})
            <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newResourceName}
        onChange={(e) => setNewResourceName(e.target.value)}
        placeholder="Resource Name"
      />
      <input
        type="text"
        value={newResourceType}
        onChange={(e) => setNewResourceType(e.target.value)}
        placeholder="Resource Type"
      />
      <button onClick={handleAddResource}>Add Resource</button>
    </div>
  );
};

export default ResourceManagement;