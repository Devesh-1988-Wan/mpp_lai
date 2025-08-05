import { useMemo } from "react";
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from "date-fns";
import { Task, TaskStatus, TaskType, TaskPriority, DocsProgressStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Link } from "lucide-react";

interface GanttChartProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function GanttChart({ tasks, onEditTask, onDeleteTask }: GanttChartProps) {

  const { dateRange, dayColumns, taskRows } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        dateRange: { start: today, end: addDays(today, 30) },
        dayColumns: [],
        taskRows: []
      };
    }

    const allDates = tasks.flatMap(task => [new Date(task.start_date), new Date(task.end_date)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const start = startOfWeek(minDate);
    const end = endOfWeek(maxDate);

    const days = eachDayOfInterval({ start, end });
    const totalDays = days.length;

    const rows = tasks.map(task => {
      const taskStartDate = new Date(task.start_date);
      const taskEndDate = new Date(task.end_date);
      const taskStart = Math.max(0, differenceInDays(taskStartDate, start));
      const taskDuration = differenceInDays(taskEndDate, taskStartDate) + 1;
      const taskWidth = Math.min(taskDuration, totalDays - taskStart);

      return {
        task,
        startOffset: (taskStart / totalDays) * 100,
        width: (taskWidth / totalDays) * 100,
        duration: differenceInDays(taskEndDate, taskStartDate) + 1
      };
    });

    return {
      dateRange: { start, end },
      dayColumns: days,
      taskRows: rows
    };
  }, [tasks]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-primary';
      case 'on-hold': return 'bg-warning';
      case 'not-started': return 'bg-[#B2BEB5]';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'milestone': return '◆';
      case 'deliverable': return '📦';
      default: return '■';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Blocker':
        return '#ff3707';
      case 'Critical':
        return '#ffa716';
      case 'High':
        return '#F4C430';
      case 'Medium':
        return '#a62dfa';
      case 'Low':
        return '#236dff';
      default:
        return '#ccc'; // A default color
    }
  }

  const getDocsProgressColor = (docsProgress: DocsProgressStatus | undefined) => {
    switch (docsProgress) {
      case 'Not Started': return '#5c7587';
      case 'In Analysis-TA': return '#5DBE3F';
      case 'In Progress': return '#5DBE3F';
      case 'Ready or Test Cases': return '#FFB302';
      case 'Handover': return '#2DCCFF';
      case 'Not Applicable': return '#ff747f';
      default: return 'transparent';
    }
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-foreground">Project Timeline</h3>
      </div>

      <div className="overflow-auto">
        {/* Header with dates */}
        <div className="flex border-b bg-timeline-bg min-w-max">
          <div className="w-80 p-3 border-r bg-card font-medium">
            Task Details
          </div>
          <div className="flex-1 flex">
            {dayColumns.map((day, index) => (
              <div
                key={index}
                className={`flex-1 min-w-[40px] p-2 text-center text-xs border-r ${isToday(day) ? 'bg-primary/20 font-semibold text-primary' : ''
                  }`}
              >
                <div>{format(day, 'dd')}</div>
                <div className="text-muted-foreground">{format(day, 'MMM')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task rows */}
        {taskRows.map(({ task, startOffset, width }) => (
          <div key={task.id} className="flex border-b hover:bg-muted/20 min-w-max">
            <div className="w-80 p-3 border-r bg-card">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getDocsProgressColor(task.docs_progress) }}
                    />
                    <span className="text-sm">{getTypeIcon(task.task_type)}</span>
                    <span className="font-medium truncate">{task.name}</span>
                    {task.work_item_link && (
                      <a href={task.work_item_link} target="_blank" rel="noopener noreferrer">
                        <Link className="h-4 w-4 text-blue-500" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(task.status)} text-white border-0`}
                    >
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: '#fff',
                        border: 0,
                      }}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>

                    {task.assignee && (
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(task.start_date), 'MMM dd')} - {format(new Date(task.end_date), 'MMM dd')}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEditTask(task)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative p-3">
              <div
                className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(task.status)} ${task.task_type === 'milestone' ? 'h-3 rotate-45' : ''
                  }`}
                style={{
                  left: `${startOffset}%`,
                  width: task.task_type === 'milestone' ? '12px' : `${width}%`
                }}
              >
                {task.task_type !== 'milestone' && (
                  <div
                    className="h-full bg-white/20 rounded-l"
                    style={{ width: `${task.progress}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No tasks yet. Add your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}