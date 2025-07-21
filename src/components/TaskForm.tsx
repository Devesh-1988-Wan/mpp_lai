import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskStatus, TaskType, CustomField } from "@/types/project";

interface TaskFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  existingTasks: Task[];
  editTask?: Task;
  customFields?: CustomField[];
}

export function TaskForm({ onSave, onCancel, existingTasks, editTask, customFields = [] }: TaskFormProps) {
  const [name, setName] = useState(editTask?.name || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [type, setType] = useState<TaskType>(editTask?.type || 'task');
  const [status, setStatus] = useState<TaskStatus>(editTask?.status || 'not-started');
  const [startDate, setStartDate] = useState<Date>(editTask?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(editTask?.endDate || new Date());
  const [dependencies, setDependencies] = useState<string[]>(editTask?.dependencies || []);
  const [assignee, setAssignee] = useState(editTask?.assignee || '');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(editTask?.customFields || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !startDate || !endDate) {
      return;
    }

    const taskData: Omit<Task, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      type,
      status,
      startDate,
      endDate,
      dependencies,
      assignee: assignee.trim(),
      progress: editTask?.progress || 0,
      customFields: customFieldValues
    };

    onSave(taskData);
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const availableDependencies = existingTasks.filter(task => task.id !== editTask?.id);

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{editTask ? 'Edit Task' : 'New Task'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: TaskType) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="deliverable">Deliverable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {availableDependencies.length > 0 && (
          <div className="space-y-2">
            <Label>Dependencies</Label>
            <Select 
              value={dependencies.join(',')} 
              onValueChange={(value) => setDependencies(value ? value.split(',') : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dependent tasks" />
              </SelectTrigger>
              <SelectContent>
                {availableDependencies.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Custom Fields</h3>
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`custom-${field.id}`}>
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input
                      id={`custom-${field.id}`}
                      value={customFieldValues[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      id={`custom-${field.id}`}
                      type="number"
                      value={customFieldValues[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, parseFloat(e.target.value) || '')}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'select' && field.options && (
                    <Select 
                      value={customFieldValues[field.id] || ''} 
                      onValueChange={(value) => handleCustomFieldChange(field.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                      <input
                        id={`custom-${field.id}`}
                        type="checkbox"
                        checked={customFieldValues[field.id] || false}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
                        className="rounded border-input"
                      />
                      <Label htmlFor={`custom-${field.id}`} className="text-sm font-normal">
                        Yes
                      </Label>
                    </div>
                  )}
                  
                  {field.type === 'date' && (
                    <Input
                      id={`custom-${field.id}`}
                      type="date"
                      value={customFieldValues[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            {editTask ? 'Update' : 'Create'} Task
          </Button>
        </div>
      </form>
    </div>
  );
}