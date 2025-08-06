import { Task } from '@/types/project';

/**
 * Converts an array of tasks into a CSV string.
 * @param tasks The array of tasks to convert.
 * @returns A string in CSV format.
 */
export const exportToCSV = (tasks: Task[]): string => {
  if (tasks.length === 0) {
    return "";
  }

  const headers = Object.keys(tasks[0]);
  const csvRows = [headers.join(',')];

  for (const task of tasks) {
    const values = headers.map(header => {
      const value = task[header as keyof Task];
      if (typeof value === 'string') {
        // Escape quotes by doubling them and wrap the value in quotes
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Triggers a download of the provided data as a file.
 * @param data The data to be downloaded.
 * @param filename The name of the file.
 * @param mimeType The MIME type of the file.
 */
export const downloadFile = (data: string, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};