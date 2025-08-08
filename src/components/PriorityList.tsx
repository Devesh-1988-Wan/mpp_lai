import { useState, useMemo } from 'react';
import { Task } from '@/types/project';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriorityListProps {
  tasks: Task[];
}

const allColumns = [
  { id: 'name', name: 'Task Name' },
  { id: 'status', name: 'Status' },
  { id: 'priority', name: 'Priority' },
  { id: 'priority_code', name: 'Priority Code' },
  { id: 'assignee', name: 'Assignee' },
  { id: 'start_date', name: 'Start Date' },
  { id: 'end_date', name: 'End Date' },
  { id: 'work_item_link', name: 'Work Item Link' },
];

export function PriorityList({ tasks }: PriorityListProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'status', 'priority', 'priority_code', 'assignee']);
  const [filter, setFilter] = useState('');
  const [filterColumn, setFilterColumn] = useState('name');

  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;
    return tasks.filter(task => {
      const taskValue = (task as any)[filterColumn];
      return taskValue?.toString().toLowerCase().includes(filter.toLowerCase());
    });
  }, [tasks, filter, filterColumn]);

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Select value={filterColumn} onValueChange={setFilterColumn}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              {allColumns.map(col => (
                <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={`Filter ${filterColumn}...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allColumns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => {
                  setVisibleColumns(prev =>
                    checked ? [...prev, column.id] : prev.filter(colId => colId !== column.id)
                  );
                }}
              >
                {column.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {allColumns.filter(col => visibleColumns.includes(col.id)).map(col => (
              <TableHead key={col.id}>{col.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => (
            <TableRow key={task.id}>
              {allColumns.filter(col => visibleColumns.includes(col.id)).map(col => (
                <TableCell key={col.id}>{(task as any)[col.id]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}