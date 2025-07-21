import { useState, useMemo } from "react";
import { Task } from "@/types/project";
import { ProjectHeader } from "@/components/ProjectHeader";
import { TaskForm } from "@/components/TaskForm";
import { DashboardTabs } from "@/components/DashboardTabs";
import { WelcomeOnboarding } from "@/components/WelcomeOnboarding";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";
import { Card } from "@/components/ui/card";

// Sample data for demonstration
const sampleTasks: Task[] = [
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
    progress: 100
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
    progress: 100
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
    progress: 65
  },
  {
    id: '4',
    name: 'Frontend Development',
    description: 'Develop user interface components and layouts',
    type: 'task', 
    status: 'in-progress',
    startDate: new Date('2024-01-12'),
    endDate: new Date('2024-01-25'),
    dependencies: ['2'],
    assignee: 'Emily Davis',
    progress: 40
  },
  {
    id: '5',
    name: 'Beta Release',
    description: 'First beta version ready for testing',
    type: 'deliverable',
    status: 'not-started',
    startDate: new Date('2024-01-26'),
    endDate: new Date('2024-01-28'),
    dependencies: ['3', '4'],
    assignee: 'Team Lead',
    progress: 0
  }
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  const projectStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const milestones = tasks.filter(task => task.type === 'milestone').length;
    
    return { total, completed, inProgress, milestones };
  }, [tasks]);

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
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, id: editingTask.id }
          : task
      ));
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
      setTasks(prev => [...prev, newTask]);
      toast({
        title: "Task Created", 
        description: `"${taskData.name}" has been added to your project.`,
      });
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.name}" has been removed from your project.`,
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    exportToExcel(tasks, 'Sample Project');
    toast({
      title: "Export Successful",
      description: "Your project plan has been exported to CSV format.",
    });
  };

  const handleStartNewProject = () => {
    setTasks([]);
    setShowOnboarding(false);
    setShowTaskForm(true);
    toast({
      title: "New Project Started",
      description: "Ready to create your first task!",
    });
  };

  // Show onboarding for new users or when there are no tasks
  if (showOnboarding || tasks.length === 0) {
    return (
      <WelcomeOnboarding
        onComplete={() => setShowOnboarding(false)}
        onStartProject={handleStartNewProject}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader
        projectName="Sample Software Project"
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

        {/* Task Form */}
        {showTaskForm && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
            existingTasks={tasks}
            editTask={editingTask}
          />
        )}

        {/* Dashboard Tabs */}
        <DashboardTabs
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onExportReport={handleExport}
        />
      </div>
    </div>
  );
};

export default Index;
