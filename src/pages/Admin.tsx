import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomField, FieldType } from '@/types/project';
import { AdminService } from '@/services/adminService'; // This service needs to be created
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// A new service file `src/services/adminService.ts` needs to be created.
// This service will handle fetching, creating, and updating custom fields.

export function Admin() {
  const queryClient = useQueryClient();
  const [newField, setNewField] = useState({ name: '', field_type: 'text' as FieldType });

  // const { data: customFields = [] } = useQuery({
  //   queryKey: ['customFields'],
  //   queryFn: AdminService.getCustomFields,
  // });

  // const createFieldMutation = useMutation({
  //   mutationFn: AdminService.createCustomField,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['customFields'] });
  //   },
  // });

  const handleCreateField = () => {
    // createFieldMutation.mutate(newField);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Manage Custom Fields</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Field Name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          />
          <Select value={newField.field_type} onValueChange={(value) => setNewField({ ...newField, field_type: value as FieldType })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Field Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateField}>Add Field</Button>
        </div>
        {/* Render existing custom fields here */}
      </div>
    </div>
  );
}