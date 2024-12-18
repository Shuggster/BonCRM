"use client"

import { useState, useEffect } from "react"
import { Activity, AlertCircle, Calendar, CheckCircle, Clock, Edit, Flag, Folder, MessageSquare, Pencil, Tag, Trash2, User, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { TaskActivity } from "@/types/comments"
import { Session } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"
import { taskActivitiesService } from '@/lib/supabase/services/task-activities'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TaskActivitiesProps {
  taskId: string
  session: Session
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

function formatActivityMessage(activity: TaskActivity) {
  switch (activity.actionType) {
    case 'status_change':
      return `Status changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'priority_change':
      return `Priority changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'title_change':
      return `Title changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'description_change':
      return activity.newValue 
        ? 'Description updated' 
        : 'Description removed'
    case 'due_date_change':
      return activity.newValue 
        ? `Due date set to ${new Date(activity.newValue).toLocaleDateString()}`
        : 'Due date removed'
    case 'group_change':
      return activity.newValue
        ? `Moved to group "${activity.newValue}"`
        : 'Removed from group'
    case 'comment_added':
      return 'Comment added'
    case 'comment_edited':
      return 'Comment edited'
    case 'comment_deleted':
      return 'Comment deleted'
    case 'assigned_change':
      return activity.newValue
        ? `Assigned to ${activity.newValue}`
        : 'Unassigned'
    default:
      return 'Task updated'
  }
}

function getActivityIcon(type: ActivityType, value?: any) {
  switch (type) {
    case 'status_change':
      return value === 'completed' 
        ? <CheckCircle className="h-4 w-4 text-green-500" />
        : value === 'in-progress'
        ? <Clock className="h-4 w-4 text-yellow-500" />
        : <AlertCircle className="h-4 w-4 text-blue-500" />
    case 'priority_change':
      return value === 'high'
        ? <Flag className="h-4 w-4 text-red-500" />
        : value === 'medium'
        ? <Flag className="h-4 w-4 text-yellow-500" />
        : <Flag className="h-4 w-4 text-blue-500" />
    case 'title_change':
      return <Tag className="h-4 w-4 text-purple-500" />
    case 'description_change':
      return <Edit className="h-4 w-4 text-indigo-500" />
    case 'due_date_change':
      return <Calendar className="h-4 w-4 text-green-500" />
    case 'group_change':
      return <Folder className="h-4 w-4 text-orange-500" />
    case 'comment_added':
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case 'comment_edited':
      return <Pencil className="h-4 w-4 text-yellow-500" />
    case 'comment_deleted':
      return <Trash2 className="h-4 w-4 text-red-500" />
    case 'assigned_change':
      return <User className="h-4 w-4 text-pink-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

function getActivityTooltip(type: ActivityType) {
  switch (type) {
    case 'status_change':
      return 'Task status updated'
    case 'priority_change':
      return 'Task priority changed'
    case 'title_change':
      return 'Task title changed'
    case 'description_change':
      return 'Task description updated'
    case 'due_date_change':
      return 'Due date modified'
    case 'group_change':
      return 'Task moved to different group'
    case 'comment_added':
      return 'New comment added'
    case 'comment_edited':
      return 'Comment edited'
    case 'comment_deleted':
      return 'Comment deleted'
    case 'assigned_change':
      return 'Task assignment changed'
    case 'attachment_added':
      return 'File attached'
    case 'attachment_removed':
      return 'File removed'
    case 'subtask_added':
      return 'Subtask added'
    case 'subtask_completed':
      return 'Subtask completed'
    default:
      return 'Task updated'
  }
}

export function TaskActivities({ taskId, session }: TaskActivitiesProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      try {
        const data = await taskActivitiesService.getActivities(taskId, session)
        setActivities(data)
      } catch (error) {
        console.error('Failed to load activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [taskId, session])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <h3 className="font-medium">Activity</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          No activity yet
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-3 group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="transition-transform group-hover:scale-110">
                      {getActivityIcon(activity.actionType, activity.newValue)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getActivityTooltip(activity.actionType)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex-1">
                <p className="text-sm">
                  {formatActivityMessage(activity)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 