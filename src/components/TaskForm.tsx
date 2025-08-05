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
import { Task, TaskStatus, TaskType, CustomField, TaskPriority, DocsProgressStatus } from "@/types/project";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onSave: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  existingTasks: Task[];
  editTask?: Task;
  customFields?: CustomField[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSave,
  onCancel,
  existingTasks,
  editTask,
  customFields = []
}) => {
  const [name, setName] = useState(editTask?.name || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [taskType, setTaskType] = useState<TaskType>(editTask?.task_type || 'task');
  const [status, setStatus] = useState<TaskStatus>(editTask?.status || 'not-started');
  const [startDate, setStartDate] = useState<Date | undefined>(
    editTask?.start_date ? new Date(editTask.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    editTask?.end_date ? new Date(editTask.end_date) : undefined
  );
  const [assignee, setAssignee] = useState(editTask?.assignee || '');
  const [progress, setProgress] = useState(editTask?.progress || 0);
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || 'Medium');
  const [developer, setDeveloper] = useState(editTask?.developer || '');
  const [estimatedDays, setEstimatedDays] = useState<number | undefined>(editTask?.estimated_days);
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(editTask?.estimated_hours);
  const [workItemLink, setWorkItemLink] = useState(editTask?.work_item_link || '');
  const [docsProgress, setDocsProgress] = useState<DocsProgressStatus>(editTask?.docs_progress || 'Not Started');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(
    editTask?.custom_fields || {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !startDate || !endDate) {
      return;
    }

    const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      project_id: editTask?.project_id || '',
      name: name.trim(),
      description: description.trim(),
      task_type: taskType,
      status,
      priority,
      developer: developer.trim(),
      estimated_days: estimatedDays,
      estimated_hours: estimatedHours,
      start_date: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      end_date: endDate.toISOString().split('T')[0],
      assignee: assignee.trim(),
      progress,
      dependencies: editTask?.dependencies || [],
      custom_fields: customFieldValues,
      work_item_link: workItemLink.trim(),
      docs_progress: docsProgress,
    };

    onSave(taskData);
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.id] || field.default_value || '';

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => setCustomFieldValues(prev => ({
              ...prev,
              [field.id]: e.target.value
            }))}
            placeholder={`Enter ${field.name}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setCustomFieldValues(prev => ({
              ...prev,
              [field.id]: parseFloat(e.target.value) || 0
            }))}
            placeholder={`Enter ${field.name}`}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : `Pick ${field.name}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => setCustomFieldValues(prev => ({
                  ...prev,
                  [field.id]: date ? date.toISOString().split('T')[0] : ''
                }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'select':
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <Select
            value={value}
            onValueChange={(newValue) => setCustomFieldValues(prev => ({
              ...prev,
              [field.id]: newValue
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any, index: number) => (
                <SelectItem key={index} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <Select
            value={String(value)}
            onValueChange={(newValue) => setCustomFieldValues(prev => ({
              ...prev,
              [field.id]: newValue === 'true'
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {editTask ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Task Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee"
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
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

          <div>
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
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blocker">Blocker</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="developer">Developer</Label>
            <Input
              id="developer"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="Enter developer name"
            />
          </div>

          <div>
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="estimated_days">Estimates in Days</Label>
            <Input
              id="estimated_days"
              type="number"
              step="0.1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(parseFloat(e.target.value) || undefined)}
              placeholder="e.g. 2.5"
            />
          </div>

          <div>
            <Label htmlFor="estimated_hours">Estimates in Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || undefined)}
              placeholder="e.g. 20"
            />
          </div>

          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
              placeholder="0-100"
            />
          </div>
          <div>
            <Label htmlFor="work_item_link">Work Item Link</Label>
            <Input
              id="work_item_link"
              value={workItemLink}
              onChange={(e) => setWorkItemLink(e.target.value)}
              placeholder="https://example.com/work-item/123"
            />
          </div>

          <div>
            <Label htmlFor="docs_progress">Docs Progress</Label>
            <Select value={docsProgress} onValueChange={(value: DocsProgressStatus) => setDocsProgress(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Analysis-TA">In Analysis-TA</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Ready or Test Cases">Ready or Test Cases</SelectItem>
                <SelectItem value="Handover">Handover</SelectItem>
                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Custom Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>
                    {field.name} {field.required && '*'}
                  </Label>
                  {renderCustomField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            {editTask ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};