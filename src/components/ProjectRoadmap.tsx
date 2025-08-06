import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Target, TrendingUp, Filter } from 'lucide-react';
import { Task } from '@/types/project';
import { format, parseISO, addMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ProjectRoadmapProps {
  tasks: Task[];
}

interface RoadmapPhase {
  name: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  color: string;
}

export function ProjectRoadmap({ tasks }: ProjectRoadmapProps) {
  const [viewMode, setViewMode] = useState<'quarterly' | 'monthly' | 'yearly'>('quarterly');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Generate roadmap phases
  const generatePhases = (): RoadmapPhase[] => {
    const phases: RoadmapPhase[] = [];
    const tasksByPhase = new Map<string, Task[]>();

    // Group tasks by their estimated quarter/month
    tasks.forEach(task => {
      const startDate = parseISO(task.start_date);
      let phaseKey: string;
      
      switch (viewMode) {
        case 'quarterly':
          const quarter = Math.ceil((startDate.getMonth() + 1) / 3);
          phaseKey = `Q${quarter} ${startDate.getFullYear()}`;
          break;
        case 'monthly':
          phaseKey = format(startDate, 'MMM yyyy');
          break;
        case 'yearly':
          phaseKey = startDate.getFullYear().toString();
          break;
        default:
          phaseKey = 'General';
      }

      if (!tasksByPhase.has(phaseKey)) {
        tasksByPhase.set(phaseKey, []);
      }
      tasksByPhase.get(phaseKey)!.push(task);
    });

    // Convert to phases
    Array.from(tasksByPhase.entries()).forEach(([phaseName, phaseTasks], index) => {
      const sortedTasks = phaseTasks.sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
      
      phases.push({
        name: phaseName,
        startDate: sortedTasks[0]?.start_date || '',
        endDate: sortedTasks[sortedTasks.length - 1]?.end_date || '',
        tasks: sortedTasks,
        color: colors[index % colors.length]
      });
    });

    return phases.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const phases = generatePhases();
  const filteredPhases = selectedPhase === 'all' ? phases : phases.filter(p => p.name === selectedPhase);

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Blocker':
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Project Roadmap</span>
          </CardTitle>
          <div className="flex space-x-4">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quarterly View</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="yearly">Yearly View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map(phase => (
                  <SelectItem key={phase.name} value={phase.name}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredPhases.map((phase, phaseIndex) => (
              <div key={phase.name} className="relative">
                {/* Phase Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-4 h-4 rounded-full ${phase.color}`}></div>
                  <div>
                    <h3 className="text-lg font-semibold">{phase.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {phase.startDate && phase.endDate && (
                        <>
                          {format(parseISO(phase.startDate), 'MMM dd')} - {format(parseISO(phase.endDate), 'MMM dd, yyyy')}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto">
                    <Badge variant="outline">
                      {phase.tasks.length} tasks
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(phase.tasks.reduce((acc, task) => acc + task.progress, 0) / phase.tasks.length)}% complete
                    </Badge>
                  </div>
                </div>

                {/* Phase Timeline */}
                <div className="relative ml-6">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>
                  <div className="space-y-4">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={task.id} className="relative flex items-start space-x-4">
                        <div className={`relative z-10 w-3 h-3 rounded-full ${phase.color} border-2 border-background`}></div>
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium">{task.name}</h4>
                                <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                                  {task.status.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(parseISO(task.start_date), 'MMM dd')} - {format(parseISO(task.end_date), 'MMM dd')}</span>
                                </span>
                                {task.assignee && (
                                  <span>Assigned to: {task.assignee}</span>
                                )}
                                <span>{task.progress}% complete</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {task.task_type === 'milestone' && (
                                <Target className="w-4 h-4 text-blue-500" />
                              )}
                              {task.task_type === 'deliverable' && (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredPhases.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No phases found for the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}