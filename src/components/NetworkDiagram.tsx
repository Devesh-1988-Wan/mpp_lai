import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Position,
} from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';
import { Task } from '@/types/project';
import '@xyflow/react/dist/style.css';

interface NetworkDiagramProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

// Custom Node Component
interface TaskNodeData {
  task: Task;
  onClick?: (task: Task) => void;
}

const TaskNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TaskNodeData;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'in-progress':
        return 'bg-blue-500 border-blue-600';
      case 'on-hold':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Blocker':
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-md bg-background border-2 min-w-[200px] ${
        selected ? 'border-primary' : 'border-border'
      }`}
      onClick={() => nodeData.onClick && nodeData.onClick(nodeData.task)}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={`text-xs ${getPriorityColor(nodeData.task.priority)}`}>
          {nodeData.task.priority}
        </Badge>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(nodeData.task.status)}`} />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate">
          {nodeData.task.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {nodeData.task.task_type.charAt(0).toUpperCase() + nodeData.task.task_type.slice(1)}
        </p>
        {nodeData.task.assignee && (
          <p className="text-xs text-muted-foreground">
            Assigned: {nodeData.task.assignee}
          </p>
        )}
        <div className="text-xs text-muted-foreground">
          Progress: {nodeData.task.progress}%
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  taskNode: TaskNode,
};

export function NetworkDiagram({ tasks, onTaskClick }: NetworkDiagramProps) {
  // Generate nodes and edges from tasks
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeSpacing = 250;
    const levelHeight = 150;

    // Create a map to track task levels based on dependencies
    const taskLevels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevel = (taskId: string, tasks: Task[]): number => {
      if (visited.has(taskId)) return taskLevels.get(taskId) || 0;
      visited.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        taskLevels.set(taskId, 0);
        return 0;
      }

      let maxLevel = 0;
      for (const depId of task.dependencies) {
        const depLevel = calculateLevel(depId, tasks);
        maxLevel = Math.max(maxLevel, depLevel + 1);
      }

      taskLevels.set(taskId, maxLevel);
      return maxLevel;
    };

    // Calculate levels for all tasks
    tasks.forEach(task => calculateLevel(task.id, tasks));

    // Group tasks by level
    const tasksByLevel = new Map<number, Task[]>();
    tasks.forEach(task => {
      const level = taskLevels.get(task.id) || 0;
      if (!tasksByLevel.has(level)) {
        tasksByLevel.set(level, []);
      }
      tasksByLevel.get(level)!.push(task);
    });

    // Create nodes
    tasksByLevel.forEach((levelTasks, level) => {
      levelTasks.forEach((task, index) => {
        const x = (index - (levelTasks.length - 1) / 2) * nodeSpacing;
        const y = level * levelHeight;

        nodes.push({
          id: task.id,
          type: 'taskNode',
          position: { x, y },
          data: {
            task,
            onClick: onTaskClick,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
      });
    });

    // Create edges based on dependencies
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          // Only create edge if the dependency task exists
          if (tasks.find(t => t.id === depId)) {
            edges.push({
              id: `${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'smoothstep',
              animated: false,
              style: { stroke: 'hsl(var(--primary))' },
            });
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, onTaskClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update nodes when tasks change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Network className="w-5 h-5" />
          <span>Network Diagram</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
          className="bg-background"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const nodeData = node.data as unknown as TaskNodeData;
              switch (nodeData?.task?.status) {
                case 'completed':
                  return '#10b981';
                case 'in-progress':
                  return '#3b82f6';
                case 'on-hold':
                  return '#f59e0b';
                default:
                  return '#6b7280';
              }
            }}
          />
          <Background gap={12} size={1} />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}