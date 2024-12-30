"use client"

import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Circle, Clock, Copy, MoreVertical, Pencil, Tag, Trash2, User, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  onTaskDuplicate?: (task: Task) => void
  onStatusChange?: (task: Task, status: 'todo' | 'in-progress' | 'completed') => void
  groups: TaskGroup[]
  users: { id: string, name: string }[]
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

export function TaskList({ tasks, onTaskClick, onTaskDelete, onTaskDuplicate, onStatusChange, groups, users }: TaskListProps) {
  const getGroup = (taskGroupId?: string) => {
    return groups.find(g => g.id === taskGroupId)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => {
        const StatusIcon = statusIcons[task.status]
        const group = getGroup(task.taskGroupId)
        
        return (
          <div
            key={task.id}
            className={cn(
              "group relative overflow-hidden",
              "p-4 rounded-xl transition-all duration-200",
              "bg-[#1C2333] hover:bg-[#1C2333]/80",
              "border border-white/10 hover:border-white/20",
              "backdrop-blur-sm shadow-lg hover:shadow-xl",
              task.status === 'completed' && "opacity-50"
            )}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <StatusIcon className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="space-y-1 cursor-pointer flex-1 min-w-0"
                      onClick={() => onTaskClick(task)}
                    >
                      <h3 className="font-medium leading-none text-gray-100 truncate">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-gray-300 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48 bg-[#0F1629] border-white/10 text-gray-100"
                      >
                        {onStatusChange && (
                          <>
                            <DropdownMenuLabel className="text-xs text-gray-400 px-2 py-1.5">
                              Change Status
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onStatusChange(task, 'todo')}
                              className="flex items-center gap-2 text-sm px-2 py-1.5 text-gray-300 hover:text-gray-100 cursor-pointer"
                              disabled={task.status === 'todo'}
                            >
                              <Circle className="h-4 w-4" />
                              To Do
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onStatusChange(task, 'in-progress')}
                              className="flex items-center gap-2 text-sm px-2 py-1.5 text-gray-300 hover:text-gray-100 cursor-pointer"
                              disabled={task.status === 'in-progress'}
                            >
                              <Clock className="h-4 w-4" />
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onStatusChange(task, 'completed')}
                              className="flex items-center gap-2 text-sm px-2 py-1.5 text-gray-300 hover:text-gray-100 cursor-pointer"
                              disabled={task.status === 'completed'}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                          </>
                        )}
                        {onTaskDuplicate && (
                          <DropdownMenuItem 
                            onClick={() => onTaskDuplicate(task)}
                            className="flex items-center gap-2 text-sm px-2 py-1.5 text-gray-300 hover:text-gray-100 cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate Task
                          </DropdownMenuItem>
                        )}
                        {onTaskDelete && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem 
                              onClick={() => onTaskDelete(task)}
                              className="flex items-center gap-2 text-sm px-2 py-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Task
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className={cn(
                  "px-2 py-0.5 rounded-full font-medium",
                  priorityColors[task.priority]
                )}>
                  {task.priority}
                </Badge>
                
                {group && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-gray-300">{group.name}</span>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
                    <Calendar className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-300">
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  </div>
                )}
                
                {task.assigned_to && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
                    {task.assigned_to_type === 'team' ? (
                      <>
                        <Users className="h-3 w-3 text-blue-400" />
                        <span className="text-gray-300">
                          {groups.find(g => g.id === task.assigned_to)?.name || 'Unknown team'}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-300">
                          {users.find(u => u.id === task.assigned_to)?.name || 'Unknown user'}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 