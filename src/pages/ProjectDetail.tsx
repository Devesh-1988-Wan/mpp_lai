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
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const projectStats = useMemo(() => {
    if (!project) return { total: 0, completed: 0, inProgress: 0, milestones: 0 };
    
    const total = project.tasks.length;
    const completed = project.tasks.filter(task => task.status === 'completed').length;
    const inProgress = project.tasks.filter(task => task.status === 'in-progress').length;
    const milestones = project.tasks.filter(task => task.type === 'milestone').length;
    
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

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = project.tasks.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, id: editingTask.id }
          : task
      );
      setProject({ ...project, tasks: updatedTasks, lastModified: new Date() });
      toast({
        title: "Task Updated",
        description: `"${taskData.name}" has been updated successfully.`,
      });
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      setProject({ ...project, tasks: [...project.tasks, newTask], lastModified: new Date() });
      toast({
        title: "Task Created", 
        description: `"${taskData.name}" has been added to your project.`,
      });
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleImportTasks = (importedTasks: Omit<Task, 'id'>[]) => {
    const newTasks = importedTasks.map(task => ({
      ...task,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setProject({ 
      ...project, 
      tasks: [...project.tasks, ...newTasks], 
      lastModified: new Date() 
    });
    toast({
      title: "Import Successful",
      description: `Imported ${newTasks.length} tasks successfully.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = project.tasks.find(task => task.id === taskId);
    const updatedTasks = project.tasks.filter(task => task.id !== taskId);
    setProject({ ...project, tasks: updatedTasks, lastModified: new Date() });
    
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.name}" has been removed from your project.`,
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    exportToExcel(project.tasks, project.name);
    toast({
      title: "Export Successful",
      description: "Your project plan has been exported to CSV format.",
    });
  };

  const handleUpdateCustomFields = (customFields: Project['customFields']) => {
    setProject({ ...project, customFields, lastModified: new Date() });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>

      <ProjectHeader
        projectName={project.name}
        totalTasks={projectStats.total}
        completedTasks={projectStats.completed}
        onAddTask={handleAddTask}
        onExport={handleExport}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">{projectStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-success">{projectStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-warning">{projectStats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-milestone">{projectStats.milestones}</div>
            <div className="text-sm text-muted-foreground">Milestones</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <ImportData onImport={handleImportTasks} />
          <CustomFieldsManager 
            customFields={project.customFields} 
            onUpdate={handleUpdateCustomFields}
          />
          <Button onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
            existingTasks={project.tasks}
            editTask={editingTask}
            customFields={project.customFields}
          />
        )}

        {/* Dashboard Tabs */}
        <DashboardTabs
          tasks={project.tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onExportReport={handleExport}
          customFields={project.customFields}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;