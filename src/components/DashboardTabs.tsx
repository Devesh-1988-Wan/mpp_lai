import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, CustomField } from "@/types/project";
import { GanttChart } from "./GanttChart";
import { ProjectReports } from "./ProjectReports";
import { TaskFilters } from "./TaskFilters";
import { PriorityList } from "./PriorityList";
import { BarChart3, Calendar, Filter, FileText, ListOrdered } from "lucide-react";

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
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
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
        <TabsTrigger value="priority" className="flex items-center space-x-2">
          <ListOrdered className="w-4 h-4" />
          <span>Priority List</span>
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
      <TabsContent value="priority" className="space-y-6">
        <PriorityList tasks={tasks} />
      </TabsContent>
    </Tabs>
  );
}