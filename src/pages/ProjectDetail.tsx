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
  
  // All other functions (`handleAddTask`, `handleSaveTask`, etc.) remain the same
  // as they were already using fields that align with the new types.
  // ... (rest of the component logic remains the same)
};

export default ProjectDetail;