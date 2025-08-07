import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Types
import { Task } from "@/types/project";

// Services
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";

// Components
import { TaskForm } from "@/components/TaskForm";
import ProjectHeader from "@/components/ProjectHeader";
import { DashboardTabs } from "@/components/DashboardTabs";
import { ImportData } from "@/components/ImportData";

// Utils & Hooks
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Early return if projectId is not present in the URL.
  // This ensures projectId is a string in all subsequent code, removing the need for `!`.
  if (!projectId) {
    return <div className="p-4">Error: Project ID is missing.</div>;
  }

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
  });

  const { data: tasks = [], isLoading: areTasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => TaskService.getProjectTasks(projectId),
  });

  // Memoize the completed tasks calculation to avoid re-calculating on every render.
  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "completed").length;
  }, [tasks]);

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id">) => {
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, taskData);
        toast({ title: "Task updated successfully." });
      } else {
        await TaskService.createTask({ ...taskData, project_id: projectId });
        toast({ title: "Task created successfully." });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      handleCloseTaskForm();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({ title: "Failed to save task.", variant: "destructive" });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      toast({ title: "Task deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({ title: "Failed to delete task.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (project && tasks.length > 0) {
      exportToExcel(tasks, `project_${project.name}_tasks`);
      toast({ title: "Tasks exported successfully." });
    } else {
      toast({ title: "No tasks to export.", variant: "destructive" });
    }
  };

  const handleImport = () => {
    setShowImportDialog(true);
  };

  const handleDataImported = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    toast({ title: "Data imported successfully!" });
    setShowImportDialog(false);
  };

  if (isProjectLoading || areTasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-4">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {showTaskForm ? (
        <TaskForm
          onSave={handleSaveTask}
          onCancel={handleCloseTaskForm}
          editTask={editingTask}
          projectId={projectId}
          existingTasks={tasks}
          customFields={project.customFields}
        />
      ) : showImportDialog ? (
        <ImportData
          projectId={projectId}
          onClose={() => setShowImportDialog(false)}
          onDataImported={handleDataImported}
        />
      ) : (
        <>
          <ProjectHeader
            projectName={project.name}
            totalTasks={tasks.length}
            completedTasks={completedTasks}
            onAddTask={() => setShowTaskForm(true)}
            onExport={handleExport}
            onImport={handleImport}
          />
          <DashboardTabs
            project={project}
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onExportReport={handleExport}
            customFields={project.customFields}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetail;