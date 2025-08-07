import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Project } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { Task } from "@/types/project";
import GanttChart from "@/components/GanttChart";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { ProjectHeader } from "@/components/ProjectHeader";
import { DashboardTabs } from "@/components/DashboardTabs";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import {ImportData} from "@/components/ImportData";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectService.getProjectById(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks = [], isLoading: areTasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => TaskService.getTasksForProject(projectId!),
    enabled: !!projectId,
  });

  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, taskData);
        toast({ title: "Task updated successfully." });
      } else {
        await TaskService.createTask({ ...taskData, project_id: projectId! });
        toast({ title: "Task created successfully." });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setShowTaskForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({ title: "Failed to save task.", variant: "destructive" });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleExport = () => {
    if (project && tasks.length > 0) {
      exportToExcel(tasks, `project_${project.name}_tasks`);
    } else {
      toast({ title: "No tasks to export.", variant: "destructive" });
    }
  };

  const handleImport = () => {
    setShowImportDialog(true);
  };

  const handleDataImported = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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
    return <div>Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {showTaskForm ? (
        <TaskForm
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          editTask={editingTask}
          projectId={projectId!}
        />
      ) : showImportDialog ? (
        <ImportData 
          projectId={projectId!} 
          onClose={() => setShowImportDialog(false)}
          onDataImported={handleDataImported}
        />
      ) : (
        <>
          <ProjectHeader
            projectName={project.name}
            totalTasks={tasks.length}
            completedTasks={tasks.filter((t) => t.status === "completed").length}
            onAddTask={() => setShowTaskForm(true)}
            onExport={handleExport}
            onImport={handleImport}
          />
          <DashboardTabs 
            project={project} 
            tasks={tasks} 
            onEditTask={handleEditTask}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetail;