import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Task, CustomField } from "@/types/project";
import { GanttChart } from "./GanttChart";
import { ProjectReports } from "./ProjectReports";
import { TaskFilters } from "./TaskFilters";
import { BarChart3, Calendar, Filter, FileText, MapPin, MessageSquare, Network, ExternalLink } from "lucide-react";
import { Timeline } from "./Timeline";
import { ProjectRoadmap } from "./ProjectRoadmap";
import { NetworkDiagram } from "./NetworkDiagram";
import { PivotTable } from "./PivotTable";

interface DashboardTabsProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onExportReport: () => void;
  customFields?: CustomField[];
}

export function DashboardTabs({ tasks, onEditTask, onDeleteTask, onExportReport, customFields = [] }: DashboardTabsProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  // Update filtered tasks when tasks change
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  return (
    <Tabs defaultValue="timeline" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
        <TabsTrigger value="timeline" className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="filters" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </TabsTrigger>
        <TabsTrigger value="roadmap" className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>Roadmap</span>
        </TabsTrigger>
        <TabsTrigger value="network" className="flex items-center space-x-2">
          <Network className="w-4 h-4" />
          <span>Network</span>
        </TabsTrigger>
        <TabsTrigger value="pivot" className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Pivot</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timeline" className="space-y-6">
        <GanttChart
          tasks={filteredTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <ProjectReports
          tasks={tasks}
          onExportReport={onExportReport}
        />
      </TabsContent>

      <TabsContent value="filters" className="space-y-6">
        <TaskFilters
          tasks={tasks}
          onFilteredTasks={setFilteredTasks}
        />
        <GanttChart
          tasks={filteredTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </TabsContent>

      <TabsContent value="roadmap" className="space-y-6">
        <ProjectRoadmap tasks={tasks} />
      </TabsContent>

      <TabsContent value="network" className="space-y-6">
        <NetworkDiagram tasks={tasks} onTaskClick={onEditTask} />
      </TabsContent>

      <TabsContent value="pivot" className="space-y-6">
        <PivotTable tasks={tasks} />
      </TabsContent>
    </Tabs>
  );
}