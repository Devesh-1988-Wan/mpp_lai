import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Project, Task, CustomField } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { CustomFieldService } from "@/services/customFieldService";
import { GanttChart } from "@/components/GanttChart";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Settings } from "lucide-react";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const [projectData, tasksData, customFieldsData] = await Promise.all([
          ProjectService.getProject(projectId),
          TaskService.getProjectTasks(projectId),
          CustomFieldService.getProjectCustomFields(projectId),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setCustomFields(customFieldsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, {...taskData, project_id: projectId});
      } else {
        await TaskService.createTask({...taskData, project_id: projectId});
      }
      setIsTaskFormOpen(false);
      setEditingTask(undefined);
      // Refetch tasks
      const tasksData = await TaskService.getProjectTasks(projectId);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await TaskService.deleteTask(taskId);
        // Refetch tasks
        const tasksData = await TaskService.getProjectTasks(projectId);
        setTasks(tasksData);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/projects" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects/${projectId}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Button onClick={() => { setEditingTask(undefined); setIsTaskFormOpen(true); }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {isTaskFormOpen ? (
        <TaskForm
          onSave={handleTaskSave}
          onCancel={() => setIsTaskFormOpen(false)}
          existingTasks={tasks}
          editTask={editingTask}
          customFields={customFields}
        />
      ) : (
        <GanttChart
          tasks={tasks}
          onViewTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default ProjectDetail;