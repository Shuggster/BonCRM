"use client"

import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Circle, Clock, MoreVertical, User } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
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

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map(task => {
        const StatusIcon = statusIcons[task.status]
        
        return (
          <div
            key={task.id}
            className={cn(
              "group p-4 rounded-lg transition-all",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              task.status === 'completed' && "opacity-50"
            )}
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-start gap-4">
              <StatusIcon className="h-5 w-5 mt-1 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
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
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 