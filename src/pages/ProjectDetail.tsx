import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task, Project } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TaskForm } from "@/components/TaskForm";
import { DashboardTabs } from "@/components/DashboardTabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResourceManagement } from "@/components/ResourceManagement";
import { BudgetManagement } from "@/components/BudgetManagement";
import { IntegrationManagement } from "@/components/IntegrationManagement";
import { IntegrationService } from "@/services/integrationService";
import { ImportData } from "@/components/ImportData"; // Import the ImportData component

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [showImportDialog, setShowImportDialog] = useState(false); // State for import dialog

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectService.getProject(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => TaskService.getProjectTasks(projectId!),
    enabled: !!projectId,
  });

  const { data: integration } = useQuery({
    queryKey: ['integration', projectId],
    queryFn: () => IntegrationService.getIntegration(projectId!),
    enabled: !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({ title: "Task Created", description: `"${newTask.name}" has been added.` });
      if (integration?.slack_webhook_url && project) {
        IntegrationService.sendSlackNotification(
          integration.slack_webhook_url,
          `New task created in project "${project.name}": *${newTask.name}*`
        );
      }
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => TaskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({ title: "Task Updated", description: "The task has been updated." });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => TaskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({ title: "Task Deleted", description: "The task has been deleted." });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    },
  });

  // Handler for importing tasks
  const handleImportTasks = async (importedTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) => {
    for (const task of importedTasks) {
      createTaskMutation.mutate({ ...task, project_id: projectId! });
    }
    setShowImportDialog(false);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createTaskMutation.mutate({ ...taskData, project_id: projectId! });
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const projectStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, milestones: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const milestones = tasks.filter(task => task.task_type === 'milestone').length;
    
    return { total, completed, inProgress, milestones };
  }, [tasks]);

  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading Project...</h2>
          <p className="text-muted-foreground">Please wait while we load your project.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">The project you are looking for does not exist.</p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button onClick={() => navigate('/projects')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <UserMenu />
        </div>
      </div>
      <ProjectHeader
        projectName={project.name}
        totalTasks={projectStats.total}
        completedTasks={projectStats.completed}
        onAddTask={() => setShowTaskForm(true)}
        onExport={() => {
          // Implement export functionality here
        }}
        onImport={() => setShowImportDialog(true)} // Pass the handler to open the dialog
      />
      <div className="container mx-auto p-6 space-y-6">
        {showTaskForm && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={() => setShowTaskForm(false)}
            existingTasks={tasks || []}
            editTask={editingTask}
            customFields={project.customFields}
          />
        )}
        {/* Add the ImportData component */}
        {showImportDialog && (
            <ImportData
                onImport={handleImportTasks}
                existingTasks={tasks}
                customFields={project.customFields}
            />
        )}
        <DashboardTabs
          tasks={tasks || []}
          onEditTask={(task) => { setEditingTask(task); setShowTaskForm(true); }}
          onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
          onExportReport={() => {
            // Implement export functionality here
          }}
          customFields={project.customFields}
        />
        {/* Temporarily disabled components due to missing database tables in types */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResourceManagement projectId={projectId!} />
          <BudgetManagement projectId={projectId!} />
        </div>
        <IntegrationManagement projectId={projectId!} />
        */}
      </div>
    </div>
  );
};

export default ProjectDetail;