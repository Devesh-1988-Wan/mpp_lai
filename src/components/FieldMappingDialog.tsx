import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/types/project";

interface FieldMapping {
  csvColumn: string;
  appField: string;
}

interface FieldMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  csvHeaders: string[];
  onConfirm: (mappings: FieldMapping[]) => void;
}

const APP_FIELDS = [
  { value: 'name', label: 'Task Name', required: true },
  { value: 'type', label: 'Type', required: false },
  { value: 'status', label: 'Status', required: false },
  { value: 'startDate', label: 'Start Date', required: true },
  { value: 'endDate', label: 'End Date', required: true },
  { value: 'assignee', label: 'Assignee', required: false },
  { value: 'progress', label: 'Progress (%)', required: false },
  { value: 'dependencies', label: 'Dependencies', required: false },
  { value: 'description', label: 'Description', required: false },
];

export function FieldMappingDialog({ isOpen, onClose, csvHeaders, onConfirm }: FieldMappingDialogProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(() => {
    // Auto-map fields based on common column names
    return APP_FIELDS.map(appField => {
      const csvColumn = findBestMatch(csvHeaders, appField.value);
      return {
        csvColumn: csvColumn || '',
        appField: appField.value
      };
    });
  });

  const findBestMatch = (headers: string[], fieldName: string): string | null => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    const matchPatterns: Record<string, string[]> = {
      name: ['task name', 'name', 'title'],
      type: ['type', 'task type'],
      status: ['status', 'task status'],
      startDate: ['start date', 'start', 'start_date'],
      endDate: ['end date', 'end', 'end_date', 'due date'],
      assignee: ['assignee', 'assigned to', 'owner'],
      progress: ['progress', 'progress (%)', 'completion'],
      dependencies: ['dependencies', 'depends on'],
      description: ['description', 'notes', 'details']
    };

    const patterns = matchPatterns[fieldName] || [];
    for (const pattern of patterns) {
      const index = lowerHeaders.indexOf(pattern);
      if (index !== -1) {
        return headers[index];
      }
    }
    return null;
  };

  const updateMapping = (appField: string, csvColumn: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.appField === appField 
        ? { ...mapping, csvColumn }
        : mapping
    ));
  };

  const getUsedColumns = () => {
    return new Set(mappings.map(m => m.csvColumn).filter(col => col !== ''));
  };

  const getAvailableColumns = (currentField: string) => {
    const usedColumns = getUsedColumns();
    const currentMapping = mappings.find(m => m.appField === currentField);
    
    return csvHeaders.filter(header => 
      !usedColumns.has(header) || header === currentMapping?.csvColumn
    );
  };

  const handleConfirm = () => {
    const validMappings = mappings.filter(m => m.csvColumn !== '');
    
    // Check if required fields are mapped
    const requiredFields = APP_FIELDS.filter(f => f.required).map(f => f.value);
    const mappedRequiredFields = validMappings
      .filter(m => requiredFields.includes(m.appField))
      .map(m => m.appField);
    
    const missingRequired = requiredFields.filter(field => 
      !mappedRequiredFields.includes(field)
    );

    if (missingRequired.length > 0) {
      const missingLabels = missingRequired
        .map(field => APP_FIELDS.find(f => f.value === field)?.label)
        .join(', ');
      alert(`Please map the following required fields: ${missingLabels}`);
      return;
    }

    onConfirm(validMappings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map CSV Fields</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Map your CSV columns to the application fields. Required fields are marked with *.
          </p>
          
          <div className="space-y-3">
            {APP_FIELDS.map(appField => (
              <div key={appField.value} className="grid grid-cols-2 gap-4 items-center">
                <Label className="text-sm font-medium">
                  {appField.label}
                  {appField.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                <Select
                  value={mappings.find(m => m.appField === appField.value)?.csvColumn || ''}
                  onValueChange={(value) => updateMapping(appField.value, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSV column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- No mapping --</SelectItem>
                    {getAvailableColumns(appField.value).map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Import with Mapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}