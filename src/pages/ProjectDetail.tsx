import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task, Project } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TaskForm } from "@/components/TaskForm";
import { ImportData } from "@/components/ImportData";
import { DashboardTabs } from "@/components/DashboardTabs";
import { CustomFieldsManager } from "@/components/CustomFieldsManager";
import { ProjectPermissions } from "@/components/ProjectPermissions";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id: string) => {
    try {
      setLoading(true);
      const projectData = await ProjectService.getProject(id);
      
      if (projectData) {
        setProject(projectData);
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Project Not Found",
        description: "The requested project could not be found.",
        variant: "destructive"
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, taskData);
        toast({ title: "Task Updated", description: `"${taskData.name}" has been updated.` });
      } else {
        await TaskService.createTask({ ...taskData, project_id: projectId! });
        toast({ title: "Task Created", description: `"${taskData.name}" has been added.` });
      }
      setShowTaskForm(false);
      setEditingTask(undefined);
      loadProject(projectId!);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId, projectId!);
      toast({ title: "Task Deleted", description: "The task has been deleted." });
      loadProject(projectId!);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (project && project.tasks) {
      exportToExcel(project.tasks, project.name);
      toast({ title: "Export Successful", description: "The project has been exported to Excel." });
    }
  };

  const projectStats = useMemo(() => {
    if (!project || !project.tasks) return { total: 0, completed: 0, inProgress: 0, milestones: 0 };
    
    const total = project.tasks.length;
    const completed = project.tasks.filter(task => task.status === 'completed').length;
    const inProgress = project.tasks.filter(task => task.status === 'in-progress').length;
    const milestones = project.tasks.filter(task => task.task_type === 'milestone').length;
    
    return { total, completed, inProgress, milestones };
  }, [project]);

  if (loading) {
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
        onExport={handleExport}
      />
      <div className="container mx-auto p-6 space-y-6">
        {showTaskForm && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={() => setShowTaskForm(false)}
            existingTasks={project.tasks || []}
            editTask={editingTask}
            customFields={project.customFields}
          />
        )}
        <DashboardTabs
          tasks={project.tasks || []}
          onEditTask={(task) => { setEditingTask(task); setShowTaskForm(true); }}
          onDeleteTask={handleDeleteTask}
          onExportReport={handleExport}
          customFields={project.customFields}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;
