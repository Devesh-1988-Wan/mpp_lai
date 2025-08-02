import { Task } from "@/types/project";

// Adapts new Task type to legacy format for backward compatibility
export function adaptTaskForLegacyComponents(task: Task) {
  return {
    ...task,
    type: task.task_type,
    startDate: new Date(task.start_date),
    endDate: new Date(task.end_date)
  };
}