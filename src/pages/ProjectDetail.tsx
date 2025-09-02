import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Types
import { Task } from "@/integrations/supabase/types";

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

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "completed").length;
  }, [tasks]);

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
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

  const handleDataImported = async (importedTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      for (const task of importedTasks) {
        await TaskService.createTask({ ...task, project_id: projectId });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast({ title: "Data imported successfully!" });
      setShowImportDialog(false);
    } catch (error) {
      console.error("Failed to import tasks:", error);
      toast({ title: "Failed to import tasks.", variant: "destructive" });
    }
  };
  
  const handleBulkUpdate = async (tasksToUpdate: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) => {
    console.log("Bulk update requested for:", tasksToUpdate);
    // Placeholder for bulk update logic
    toast({
      title: "Bulk Update",
      description: "Bulk update functionality is not yet implemented.",
    });
    setShowImportDialog(false);
  };
  
  const handleBulkDelete = async (taskNames: string[]) => {
    console.log("Bulk delete requested for:", taskNames);
    // Placeholder for bulk delete logic
    toast({
      title: "Bulk Delete",
      description: "Bulk delete functionality is not yet implemented.",
    });
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
        <div className="container mx-auto p-6">
          <TaskForm
            onSave={handleSaveTask}
            onCancel={handleCloseTaskForm}
            editTask={editingTask}
            projectId={projectId}
            existingTasks={tasks}
            customFields={project.customFields}
          />
        </div>
      ) : showImportDialog ? (
        <div className="container mx-auto p-6">
            <ImportData
              onImport={handleDataImported}
              onBulkUpdate={handleBulkUpdate}
              onBulkDelete={handleBulkDelete}
              existingTasks={tasks}
              customFields={project.customFields}
            />
        </div>
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
          <div className="container mx-auto p-6">
            <DashboardTabs
              tasks={tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onExportReport={handleExport}
              customFields={project.customFields}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDetail;