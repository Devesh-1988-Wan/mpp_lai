// @ts-nocheck
import { Task, Project } from "@/types/project";
import { format } from "date-fns";

export function exportToCSV(tasks: Task[], projectName: string = 'Project') {
  const headers = [
    'Task Name',
    'Type',
    'Status',
    'Priority',
    'Start Date',
    'End Date',
    'Duration (days)',
    'Assignee',
    'Developer',
    'Estimated Days',
    'Estimated Hours',
    'Progress (%)',
    'Dependencies',
    'Description',
    'Work Item Link',
    'Docs Progress'
  ];

  const csvData = tasks.map(task => {
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return [
      task.name,
      task.task_type,
      task.status,
      task.priority,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      duration.toString(),
      task.assignee || '',
      task.developer || '',
      task.estimated_days?.toString() || '',
      task.estimated_hours?.toString() || '',
      task.progress.toString(),
      task.dependencies.join('; '),
      task.description || '',
      task.work_item_link || '',
      task.docs_progress || ''
    ];
  });

  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${projectName}_tasks_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToExcel(tasks: Task[], projectName: string = 'Project') {
  // For Excel export, we'll generate a more structured CSV that Excel can interpret
  const headers = [
    'ID',
    'Task Name',
    'Type',
    'Status',
    'Priority',
    'Start Date',
    'End Date',
    'Duration (days)',
    'Assignee',
    'Developer',
    'Estimated Days',
    'Estimated Hours',
    'Progress (%)',
    'Dependencies',
    'Description',
    'Work Item Link',
    'Docs Progress'
  ];

  const excelData = tasks.map(task => {
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return [
      task.id,
      task.name,
      task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1),
      task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' '),
      task.priority,
      format(startDate, 'MM/dd/yyyy'),
      format(endDate, 'MM/dd/yyyy'),
      duration,
      task.assignee || 'Unassigned',
      task.developer || 'Unassigned',
      task.estimated_days || 0,
      task.estimated_hours || 0,
      task.progress,
      task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None',
      task.description || 'No description',
      task.work_item_link || 'None',
      task.docs_progress || 'Not Started'
    ];
  });

  // Add summary section
  const summaryHeaders = ['Project Summary', '', '', '', '', '', '', '', '', '', ''];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  
  const summaryData = [
    ['Total Tasks', totalTasks, '', '', '', '', '', '', '', '', ''],
    ['Completed Tasks', completedTasks, '', '', '', '', '', '', '', '', ''],
    ['In Progress Tasks', inProgressTasks, '', '', '', '', '', '', '', '', ''],
    ['Completion Rate', `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''] // Empty row
  ];

  const csvContent = [summaryHeaders, ...summaryData, headers, ...excelData]
    .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${projectName}_project_plan_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateProjectSummary(tasks: Task[]): string {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const milestones = tasks.filter(task => task.task_type === 'milestone').length;
  const deliverables = tasks.filter(task => task.task_type === 'deliverable').length;

  return `Project Summary:
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
- In Progress: ${inProgressTasks}
- Milestones: ${milestones}
- Deliverables: ${deliverables}`;
}