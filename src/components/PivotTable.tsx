import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, Settings } from 'lucide-react';
import { Task } from '@/types/project';

interface PivotTableProps {
  tasks: Task[];
}

interface PivotData {
  [key: string]: {
    [key: string]: {
      count: number;
      avgProgress: number;
      tasks: Task[];
    };
  };
}

export function PivotTable({ tasks }: PivotTableProps) {
  const [rowField, setRowField] = useState<string>('status');
  const [columnField, setColumnField] = useState<string>('priority');
  const [valueField, setValueField] = useState<string>('count');
  const [showDetails, setShowDetails] = useState(false);

  const availableFields = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'task_type', label: 'Task Type' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'developer', label: 'Developer' },
    { key: 'docs_progress', label: 'Docs Progress' },
  ];

  const valueFields = [
    { key: 'count', label: 'Count' },
    { key: 'avgProgress', label: 'Average Progress' },
    { key: 'totalEstimatedHours', label: 'Total Estimated Hours' },
    { key: 'totalEstimatedDays', label: 'Total Estimated Days' },
  ];

  const generatePivotData = (): PivotData => {
    const pivotData: PivotData = {};

    tasks.forEach(task => {
      const rowValue = task[rowField as keyof Task] as string || 'N/A';
      const columnValue = task[columnField as keyof Task] as string || 'N/A';

      if (!pivotData[rowValue]) {
        pivotData[rowValue] = {};
      }

      if (!pivotData[rowValue][columnValue]) {
        pivotData[rowValue][columnValue] = {
          count: 0,
          avgProgress: 0,
          tasks: [],
        };
      }

      pivotData[rowValue][columnValue].count += 1;
      pivotData[rowValue][columnValue].tasks.push(task);
    });

    // Calculate averages
    Object.keys(pivotData).forEach(rowKey => {
      Object.keys(pivotData[rowKey]).forEach(colKey => {
        const cell = pivotData[rowKey][colKey];
        cell.avgProgress = cell.tasks.reduce((sum, task) => sum + task.progress, 0) / cell.count;
      });
    });

    return pivotData;
  };

  const pivotData = generatePivotData();
  const rowKeys = Object.keys(pivotData).sort();
  const columnKeys = Array.from(
    new Set(Object.values(pivotData).flatMap(row => Object.keys(row)))
  ).sort();

  const getCellValue = (rowKey: string, columnKey: string) => {
    const cell = pivotData[rowKey]?.[columnKey];
    if (!cell) return 0;

    switch (valueField) {
      case 'count':
        return cell.count;
      case 'avgProgress':
        return Math.round(cell.avgProgress);
      case 'totalEstimatedHours':
        return cell.tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      case 'totalEstimatedDays':
        return cell.tasks.reduce((sum, task) => sum + (task.estimated_days || 0), 0);
      default:
        return cell.count;
    }
  };

  const getCellTasks = (rowKey: string, columnKey: string): Task[] => {
    return pivotData[rowKey]?.[columnKey]?.tasks || [];
  };

  const getRowTotal = (rowKey: string) => {
    return columnKeys.reduce((sum, colKey) => sum + getCellValue(rowKey, colKey), 0);
  };

  const getColumnTotal = (columnKey: string) => {
    return rowKeys.reduce((sum, rowKey) => sum + getCellValue(rowKey, columnKey), 0);
  };

  const getGrandTotal = () => {
    return rowKeys.reduce((sum, rowKey) => sum + getRowTotal(rowKey), 0);
  };

  const exportToCSV = () => {
    const csvData = [
      ['', ...columnKeys, 'Total'],
      ...rowKeys.map(rowKey => [
        rowKey,
        ...columnKeys.map(colKey => getCellValue(rowKey, colKey)),
        getRowTotal(rowKey),
      ]),
      ['Total', ...columnKeys.map(colKey => getColumnTotal(colKey)), getGrandTotal()],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pivot-table-${rowField}-${columnField}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Pivot Table Analysis</span>
          </CardTitle>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium">Rows:</label>
              <Select value={rowField} onValueChange={setRowField}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Columns:</label>
              <Select value={columnField} onValueChange={setColumnField}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Values:</label>
              <Select value={valueField} onValueChange={setValueField}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {valueFields.map(field => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">
                    {availableFields.find(f => f.key === rowField)?.label} / {availableFields.find(f => f.key === columnField)?.label}
                  </TableHead>
                  {columnKeys.map(colKey => (
                    <TableHead key={colKey} className="text-center font-semibold">
                      {colKey}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold bg-muted">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowKeys.map(rowKey => (
                  <TableRow key={rowKey}>
                    <TableCell className="font-medium bg-muted">
                      {rowKey}
                    </TableCell>
                    {columnKeys.map(colKey => {
                      const cellValue = getCellValue(rowKey, colKey);
                      const cellTasks = getCellTasks(rowKey, colKey);
                      
                      return (
                        <TableCell key={colKey} className="text-center">
                          {cellValue > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="outline">{cellValue}</Badge>
                              {showDetails && cellTasks.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {cellTasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="truncate max-w-[100px]">
                                      {task.name}
                                    </div>
                                  ))}
                                  {cellTasks.length > 3 && (
                                    <div>+{cellTasks.length - 3} more</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold bg-muted">
                      <Badge variant="secondary">{getRowTotal(rowKey)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-semibold bg-muted">Total</TableCell>
                  {columnKeys.map(colKey => (
                    <TableCell key={colKey} className="text-center font-semibold bg-muted">
                      <Badge variant="secondary">{getColumnTotal(colKey)}</Badge>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold bg-muted">
                    <Badge>{getGrandTotal()}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {rowKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data available for the selected fields.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}