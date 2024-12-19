"use client"

import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Circle, Clock, Copy, MoreVertical, Pencil, Tag, Trash2, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  onTaskDuplicate?: (task: Task) => void
  onStatusChange?: (task: Task, status: 'todo' | 'in-progress' | 'completed') => void
  groups: TaskGroup[]
}

const priorityColors = {
  low: "bg-blue-500/20 text-blue-500",
  medium: "bg-yellow-500/20 text-yellow-500",
  high: "bg-red-500/20 text-red-500"
}

const statusIcons = {
  'todo': Circle,
  'in-progress': Clock,
  'completed': CheckCircle2
}

export function TaskList({ tasks, onTaskClick, onTaskDelete, onTaskDuplicate, onStatusChange, groups }: TaskListProps) {
  const getGroup = (taskGroupId?: string) => {
    return groups.find(g => g.id === taskGroupId)
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => {
        const StatusIcon = statusIcons[task.status]
        const group = getGroup(task.taskGroupId)
        
        return (
          <div
            key={task.id}
            className={cn(
              "group p-4 rounded-lg transition-all",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              task.status === 'completed' && "opacity-50"
            )}
          >
            <div className="flex items-start gap-4">
              <StatusIcon className="h-5 w-5 mt-1 text-muted-foreground" />
　　 　 　 　
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div 
                    className="space-y-1 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <h3 className="font-medium leading-none">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onTaskClick(task)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      
                      {onTaskDuplicate && (
                        <DropdownMenuItem onClick={() => onTaskDuplicate(task)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate Task
                        </DropdownMenuItem>
                      )}

                      {onStatusChange && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(task, 'todo')}
                            disabled={task.status === 'todo'}
                          >
                            <Circle className="mr-2 h-4 w-4" />
                            Mark as Todo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(task, 'in-progress')}
                            disabled={task.status === 'in-progress'}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(task, 'completed')}
                            disabled={task.status === 'completed'}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                        </>
                      )}

                      {onTaskDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onTaskDelete(task)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  
                  {group && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                        {group.name}
                      </div>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  )}
                  
                  {task.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 