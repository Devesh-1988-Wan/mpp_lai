"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Project, Task, CustomField } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { CustomFieldService } from "@/services/customFieldService";
import { GanttChart } from "@/components/GanttChart";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('gantt');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData, customFieldsData] = await Promise.all([
        ProjectService.getProjectById(projectId),
        TaskService.getProjectTasks(projectId),
        CustomFieldService.getProjectCustomFields(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setCustomFields(customFieldsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, { ...taskData, project_id: projectId });
      } else {
        await TaskService.createTask({ ...taskData, project_id: projectId });
      }
      loadProjectData(); // Reload all data
      setIsTaskFormOpen(false);
      setEditingTask(undefined);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await TaskService.deleteTask(taskId);
        loadProjectData(); // Reload tasks
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleAddNewTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (error) return <div className="p-4 text-destructive">Error: {error}</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('gantt')}
          >
            <List className="h-4 w-4 mr-2" /> Gantt
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
          </Button>
        </div>
        <Button onClick={handleAddNewTask}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add New Task
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
        <>
          {viewMode === 'gantt' && (
            <GanttChart
              tasks={tasks}
              onViewTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}