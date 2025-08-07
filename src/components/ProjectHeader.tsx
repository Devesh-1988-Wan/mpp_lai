import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload, Download } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";

// Define an interface for the props the component will accept
interface ProjectHeaderProps {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  onAddTask: () => void;
  onExport: () => void;
  onImport: () => void;
}

const ProjectHeader = ({
  projectName,
  totalTasks,
  completedTasks,
  onAddTask,
  onExport,
  onImport,
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-header-background text-header-foreground border-b">
      <div className="container mx-auto px-6 py-4">
        {/* Top row for navigation and user menu */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* * UPDATE: Added `aria-label` for accessibility.
              * This provides a descriptive text for screen readers on icon-only buttons.
            */}
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")} aria-label="Back to projects">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">{projectName}</h1>
          </div>
          <UserMenu />
        </div>

        {/* Bottom row for stats and actions */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-header-foreground">
              <div>
                <span className="font-bold">{totalTasks}</span>
                <span className="opacity-75 ml-1">Total Tasks</span>
              </div>
              <div>
                <span className="font-bold">{completedTasks}</span>
                <span className="opacity-75 ml-1">Completed</span>
              </div>
              <div>
                <span className="font-bold">{progress.toFixed(0)}%</span>
                <span className="opacity-75 ml-1">Progress</span>
              </div>
            </div>
          <div className="flex items-center gap-2">
            {/* * NOTE: For custom styles like this, creating a new Button variant (e.g., variant="outline-inverse") 
              * in your UI library's configuration is a great practice for reusability. 
              * For a one-off case, this className override is perfectly acceptable.
            */}
            <Button variant="outline" size="sm" onClick={onImport} className="bg-transparent text-white border-white hover:bg-white hover:text-black">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} className="bg-transparent text-white border-white hover:bg-white hover:text-black">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={onAddTask}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;