"use client"

import { useEffect, useState } from "react"
import { TaskActivity, taskActivitiesService } from "@/lib/supabase/services/task-activities"
import { Session } from "@supabase/supabase-js"
import { formatDistanceToNow, format } from "date-fns"
import { Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Flag, 
  Tag, 
  Edit, 
  Calendar, 
  Folder 
} from "lucide-react"
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription'

interface TaskActivitiesProps {
  taskId: string
  session: Session
}

export function TaskActivities({ taskId, session }: TaskActivitiesProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [taskId])

  const loadActivities = async () => {
    try {
      const data = await taskActivitiesService.getActivities(taskId, session)
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRealtimeInsert = (payload: any) => {
    const newActivity = {
      id: payload.new.id,
      taskId: payload.new.task_id,
      userId: payload.new.user_id,
      actionType: payload.new.action_type,
      previousValue: payload.new.previous_value,
      newValue: payload.new.new_value,
      createdAt: new Date(payload.new.created_at)
    } as TaskActivity

    setActivities(prev => [newActivity, ...prev])
  }

  const handleRealtimeUpdate = (payload: any) => {
    setActivities(prev => prev.map(activity => 
      activity.id === payload.new.id 
        ? {
            ...activity,
            actionType: payload.new.action_type,
            previousValue: payload.new.previous_value,
            newValue: payload.new.new_value,
          }
        : activity
    ))
  }

  useRealtimeSubscription('task_activities', 'INSERT', handleRealtimeInsert)
  useRealtimeSubscription('task_activities', 'UPDATE', handleRealtimeUpdate)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <h3 className="font-medium">Activity</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="text-sm flex items-start gap-2">
              {getActivityIcon(activity.actionType, activity.newValue)}
              <div>
                <p className="text-muted-foreground">
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

function formatActivityMessage(activity: TaskActivity): string {
  switch (activity.actionType) {
    case 'status_change':
      return `Status changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'priority_change':
      return `Priority changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'title_change':
      return `Title changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'description_change':
      return `Description updated`
    case 'due_date_change':
      return activity.newValue 
        ? `Due date set to ${format(new Date(activity.newValue), 'PPP')}`
        : `Due date removed`
    case 'group_change':
      return activity.newValue
        ? `Moved to group "${activity.newValue}"`
        : `Removed from group`
    default:
      return `Unknown activity`
  }
}

function getActivityIcon(type: TaskActivity['actionType'], value?: any) {
  switch (type) {
    case 'status_change':
      return value === 'completed' 
        ? <CheckCircle className="h-4 w-4 text-green-500" />
        : value === 'in-progress'
        ? <Clock className="h-4 w-4 text-yellow-500" />
        : <AlertCircle className="h-4 w-4 text-blue-500" />
    case 'priority_change':
      return <Flag className={`h-4 w-4 ${
        value === 'high' ? 'text-red-500' : 
        value === 'medium' ? 'text-yellow-500' : 
        'text-blue-500'
      }`} />
    case 'title_change':
      return <Edit className="h-4 w-4 text-blue-500" />
    case 'description_change':
      return <Edit className="h-4 w-4 text-purple-500" />
    case 'due_date_change':
      return <Calendar className="h-4 w-4 text-orange-500" />
    case 'group_change':
      return <Folder className="h-4 w-4 text-indigo-500" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
} 