import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjectById } from '../store/slices/projectSlice';
import { RootState, AppDispatch } from '../store/store';
import { GanttChart } from '../components/GanttChart'; // Corrected import
import TaskForm from '../components/TaskForm';
import ProjectHeader from '../components/ProjectHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ResourceManagement from '../components/ResourceManagement';
import BudgetManagement from '../components/BudgetManagement';
import IntegrationManagement from '../components/IntegrationManagement';
import ProjectPermissions from '../components/ProjectPermissions';
import ProjectReports from '../components/ProjectReports';
import { Skeleton } from '../components/ui/skeleton';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, loading, error } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  if (loading) {
    return (
        <div className="p-4 md:p-8">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!currentProject) {
    return <div className="p-4">Project not found.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <ProjectHeader
        projectName={currentProject.name}
        totalTasks={currentProject.tasks?.length || 0}
        completedTasks={currentProject.tasks?.filter(t => t.status === 'completed').length || 0}
        onAddTask={() => {}}
        onExport={() => {}}
        onImport={() => {}}
      />
      <Tabs defaultValue="gantt" className="mt-4">
        <TabsList>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="gantt" className="mt-4">
          <GanttChart tasks={currentProject.tasks || []} onEditTask={() => {}} onDeleteTask={() => {}} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          <TaskForm
            onSave={() => {}}
            onCancel={() => {}}
            existingTasks={currentProject.tasks || []}
            customFields={currentProject.customFields || []}
          />
        </TabsContent>
        <TabsContent value="resources" className="mt-4">
            <ResourceManagement projectId={currentProject.id} />
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
            <BudgetManagement projectId={currentProject.id} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
            <IntegrationManagement projectId={currentProject.id} />
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
            <ProjectPermissions projectId={currentProject.id} teamMembers={currentProject.team_members} onUpdateTeamMembers={() => {}} isOwner={true} />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
            <ProjectReports tasks={currentProject.tasks || []} onExportReport={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;