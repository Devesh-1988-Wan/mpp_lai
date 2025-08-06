import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Task } from '@/types/project';
import { format, parseISO } from 'date-fns';

interface TimelineProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'start' | 'end' | 'milestone';
  taskId: string;
}

export function Timeline({ tasks, onUpdateTask }: TimelineProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Generate timeline events from tasks
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    tasks.forEach(task => {
      // Task start event
      events.push({
        id: `${task.id}-start`,
        title: `${task.name} - Start`,
        date: task.start_date,
        type: 'start',
        taskId: task.id
      });

      // Task end event
      events.push({
        id: `${task.id}-end`,
        title: `${task.name} - End`,
        date: task.end_date,
        type: 'end',
        taskId: task.id
      });

      // Milestone events
      if (task.task_type === 'milestone') {
        events.push({
          id: `${task.id}-milestone`,
          title: `${task.name} - Milestone`,
          date: task.end_date,
          type: 'milestone',
          taskId: task.id
        });
      }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const timelineEvents = generateTimelineEvents();

  const getEventColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-green-500';
      case 'end':
        return 'bg-red-500';
      case 'milestone':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <Clock className="w-4 h-4" />;
      case 'end':
        return <Clock className="w-4 h-4" />;
      case 'milestone':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Project Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline Controls */}
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <Label htmlFor="filter-date">Filter by Date</Label>
                <Input
                  id="filter-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </Button>
            </div>

            {/* Timeline Display */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              <div className="space-y-4">
                {timelineEvents
                  .filter(event => !selectedDate || event.date === selectedDate)
                  .map((event, index) => (
                    <div key={event.id} className="relative flex items-center space-x-4">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getEventColor(event.type)} text-white`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {event.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(event.date), 'PPP')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {timelineEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No timeline events found. Add tasks to see timeline entries.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}