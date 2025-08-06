// src/components/ResourceManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resource, ResourceService } from '@/services/resourceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceManagementProps {
  projectId: string;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<'human' | 'equipment' | 'material'>('human');

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['resources', projectId],
    queryFn: () => ResourceService.getResourcesForProject(projectId),
  });

  const createResourceMutation = useMutation({
    mutationFn: (newResource: Omit<Resource, 'id'>) => ResourceService.createResource(newResource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', projectId] });
      setNewResourceName('');
      toast({ title: 'Resource added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add resource', variant: 'destructive' });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => ResourceService.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', projectId] });
      toast({ title: 'Resource deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete resource', variant: 'destructive' });
    },
  });

  const handleAddResource = () => {
    if (newResourceName.trim()) {
      createResourceMutation.mutate({
        project_id: projectId,
        name: newResourceName.trim(),
        type: newResourceType,
        availability: 100,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New resource name"
            value={newResourceName}
            onChange={(e) => setNewResourceName(e.target.value)}
          />
          <Select value={newResourceType} onValueChange={(value) => setNewResourceType(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="human">Human</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="material">Material</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddResource} disabled={createResourceMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {isLoading ? (
          <p>Loading resources...</p>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-2 border rounded-lg">
                <span>{resource.name} ({resource.type})</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteResourceMutation.mutate(resource.id)}
                  disabled={deleteResourceMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};