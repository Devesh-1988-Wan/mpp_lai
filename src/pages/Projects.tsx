import { useState } from "react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Calendar, Users, Archive } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ProjectForm } from "@/components/ProjectForm";
import { useToast } from "@/hooks/use-toast";

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Sample Software Project',
    description: 'A comprehensive software development project with multiple phases',
    createdDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15'),
    status: 'active',
    tasks: [],
    customFields: [],
    teamMembers: ['Sarah Johnson', 'Alex Chen', 'Mike Rodriguez', 'Emily Davis']
  },
  {
    id: '2',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    createdDate: new Date('2023-12-15'),
    lastModified: new Date('2024-01-10'),
    status: 'completed',
    tasks: [],
    customFields: [],
    teamMembers: ['John Smith', 'Lisa Wang']
  },
  {
    id: '3',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application development',
    createdDate: new Date('2024-01-05'),
    lastModified: new Date('2024-01-12'),
    status: 'active',
    tasks: [],
    customFields: [],
    teamMembers: ['David Lee', 'Anna Martinez', 'Tom Wilson']
  }
];

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  const handleCreateProject = () => {
    setEditingProject(undefined);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdDate' | 'lastModified'>) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(project => 
        project.id === editingProject.id 
          ? { 
              ...projectData, 
              id: editingProject.id,
              createdDate: editingProject.createdDate,
              lastModified: new Date()
            }
          : project
      ));
      toast({
        title: "Project Updated",
        description: `"${projectData.name}" has been updated successfully.`,
      });
    } else {
      // Create new project
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdDate: new Date(),
        lastModified: new Date()
      };
      setProjects(prev => [...prev, newProject]);
      toast({
        title: "Project Created",
        description: `"${projectData.name}" has been created successfully.`,
      });
    }
    setShowProjectForm(false);
    setEditingProject(undefined);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (project) {
      toast({
        title: "Project Deleted",
        description: `"${project.name}" has been deleted.`,
        variant: "destructive"
      });
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground">Manage your project portfolio</p>
            </div>
            <Button onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Projects' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Project Form */}
        {showProjectForm && (
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => {
              setShowProjectForm(false);
              setEditingProject(undefined);
            }}
            editProject={editingProject}
          />
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(project.status)}
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(project.createdDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.teamMembers.length}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Last updated: {format(project.lastModified, 'MMM dd, yyyy')}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenProject(project.id)}
                    className="flex-1"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditProject(project)}
                  >
                    Edit
                  </Button>
                  {project.status !== 'archived' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No projects found
            </h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus === 'all' 
                ? 'Create your first project to get started.' 
                : `No ${filterStatus} projects found.`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;