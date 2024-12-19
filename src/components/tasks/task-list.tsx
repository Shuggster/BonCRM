"use client"

import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Circle, Clock, Copy, MoreVertical, Pencil, Tag, Trash2, User, ArrowDown, ArrowRight, ArrowUp, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

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

const statusStyles = {
  'todo': "text-blue-500",
  'in-progress': "text-yellow-500",
  'completed': "text-green-500"
}

const priorityIcons = {
  low: <ArrowDown className="h-3 w-3" />,
  medium: <ArrowRight className="h-3 w-3" />,
  high: <ArrowUp className="h-3 w-3" />
}

const getDueDateColor = (date: Date) => {
  const today = new Date()
  const dueDate = new Date(date)
  
  if (dueDate < today) return "text-red-500"
  if (dueDate.toDateString() === today.toDateString()) return "text-yellow-500"
  return "text-muted-foreground"
}

export function TaskList({ 
  tasks, 
  onTaskClick, 
  onTaskDelete, 
  onTaskDuplicate, 
  onStatusChange, 
  groups 
}: TaskListProps) {
  const getGroup = (taskGroupId?: string) => {
    return groups.find(g => g.id === taskGroupId)
  }

  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="secondary">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Badge>
      </div>
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
              <StatusIcon className={cn(
                "h-5 w-5 mt-1",
                statusStyles[task.status],
                task.status === 'completed' && "opacity-50"
              )} />
              
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
                    {priorityIcons[task.priority]}
                    <span className="ml-1">{task.priority}</span>
                  </Badge>
                  
                  {group && (
                    <div className="flex items-center gap-1">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="truncate max-w-[100px]">{group.name}</span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1",
                      getDueDateColor(task.dueDate)
                    )}>
                      <Calendar className="h-3 w-3" />
                      {format(task.dueDate, 'MMM d')}
                    </div>
                  )}
                  
                  {task.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned
                    </div>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                  {task.status !== 'completed' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setLoadingTaskId(task.id)
                            await onStatusChange(task, 'completed')
                            setLoadingTaskId(null)
                          }}
                          className="h-8 w-8"
                          disabled={loadingTaskId === task.id}
                        >
                          {loadingTaskId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mark as Complete</TooltipContent>
                    </Tooltip>
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