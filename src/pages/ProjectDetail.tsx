import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task, Project } from "@/types/project";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TaskForm } from "@/components/TaskForm";
import { ImportData } from "@/components/ImportData";
import { DashboardTabs } from "@/components/DashboardTabs";
import { CustomFieldsManager } from "@/components/CustomFieldsManager";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";

// Mock function to get project data - in real app this would come from API/database
const getProjectById = (id: string): Project | null => {
  // Sample project data
  const sampleProjects: Project[] = [
    {
      id: '1',
      name: 'Sample Software Project',
      description: 'A comprehensive software development project with multiple phases',
      createdDate: new Date('2024-01-01'),
      lastModified: new Date('2024-01-15'),
      status: 'active',
      customFields: [
        {
          id: 'cf1',
          name: 'Priority',
          type: 'select',
          required: true,
          options: ['Low', 'Medium', 'High', 'Critical']
        },
        {
          id: 'cf2',
          name: 'Estimated Hours',
          type: 'number',
          required: false
        }
      ],
      teamMembers: ['Sarah Johnson', 'Alex Chen', 'Mike Rodriguez', 'Emily Davis'],
      tasks: [
        {
          id: '1',
          name: 'Project Planning & Requirements',
          description: 'Define project scope, gather requirements, and create initial project plan',
          type: 'task',
          status: 'completed',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-07'),
          dependencies: [],
          assignee: 'Sarah Johnson',
          progress: 100,
          customFields: {
            'cf1': 'High',
            'cf2': 40
          }
        },
        {
          id: '2', 
          name: 'Design Phase Kickoff',
          description: 'Begin UI/UX design and architecture planning',
          type: 'milestone',
          status: 'completed',
          startDate: new Date('2024-01-08'),
          endDate: new Date('2024-01-08'),
          dependencies: ['1'],
          assignee: 'Alex Chen',
          progress: 100,
          customFields: {
            'cf1': 'Critical'
          }
        },
        {
          id: '3',
          name: 'Database Architecture',
          description: 'Design and implement database schema and relationships',
          type: 'task',
          status: 'in-progress',
          startDate: new Date('2024-01-09'),
          endDate: new Date('2024-01-15'),
          dependencies: ['2'],
          assignee: 'Mike Rodriguez',
          progress: 65,
          customFields: {
            'cf1': 'Medium',
            'cf2': 60
          }
        }
      ]
    }
  ];

  return sampleProjects.find(p => p.id === id) || null;
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  useEffect(() => {
    if (projectId) {
      const projectData = getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        toast({
          title: "Project Not Found",
          description: "The requested project could not be found.",
          variant: "destructive"
        });
        navigate('/projects');
      }
    }
  }, [projectId, navigate, toast]);

  const projectStats = useMemo(() => {
    if (!project) return { total: 0, completed: 0, inProgress: 0, milestones: 0 };
    
    const total = project.tasks.length;
    const completed = project.tasks.filter(task => task.status === 'completed').length;
    const inProgress = project.tasks.filter(task => task.status === 'in-progress').length;
    const milestones = project.tasks.filter(task => task.type === 'milestone').length;
    
    return { total, completed, inProgress, milestones };
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
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