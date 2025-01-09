'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, Clock, CheckSquare, BarChart3, Pencil, 
  Users, Tag, MessageSquare, History, Loader2, User as UserIcon, X, Plus, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { taskCommentsService } from '@/lib/supabase/services/task-comments'
import { taskActivitiesService, type TaskActivity } from '@/lib/supabase/services/task-activities'
import type { Task } from '@/types/tasks'
import type { TaskComment } from '@/types/comments'
import type { User as DbUser } from './TaskFormContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MiniCalendar } from '@/components/calendar/mini-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskViewProps {
  task: Task
  section: 'upper' | 'lower'
  onClose: () => void
  onEdit?: (task: Task) => Promise<Task>
}

interface TaskGroup {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  name?: string;
  email: string;
}

interface EditedTask {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  status: 'todo' | 'in-progress' | 'completed';
  task_group_id: string | null;
  assigned_to: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  task_groups: TaskGroup | null;
  assigned_user?: User;
}

export function TaskView({ task, section, onClose, onEdit }: TaskViewProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const { session } = useSupabaseSession()
  const supabase = createClientComponentClient()

  // Fetch activities
  useEffect(() => {
    async function fetchActivities() {
      if (!session) return
      try {
        const data = await taskActivitiesService.getActivities(task.id, session)
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setIsLoadingActivities(false)
      }
    }

    if (section === 'lower') {
      fetchActivities()
    }
  }, [task.id, session, section])

  // Upper section shows task details and quick actions
  if (section === 'upper') {
    return (
      <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
        style={{ 
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
        }}
      >
        <div className="relative z-10">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{task.title}</h2>
                <p className="text-zinc-400 mt-1">Task Details</p>
              </div>
              {onEdit && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => onEdit(task)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Task Details */}
            <div className="mt-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Description</h3>
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                  <p className="text-sm">{task.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                  </div>
                  <div className="mt-1">
                    <span className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    )}>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'Completed'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-medium text-zinc-400">Priority</h3>
                  </div>
                  <div className="mt-1">
                    <span className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    )}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-zinc-400">Due Date</h3>
                </div>
                <div className="mt-1">
                  <div className="text-sm">
                    {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date set'}
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-zinc-400">Assigned To</h3>
                </div>
                <div className="mt-1">
                  <div className="text-sm">
                    {task.assigned_to ? 'Assigned' : 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Task Group */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-zinc-400">Task Group</h3>
                </div>
                <div className="mt-1">
                  <div className="text-sm flex items-center gap-2">
                    {task.task_groups ? (
                      <>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: task.task_groups.color }}
                        />
                        {task.task_groups.name}
                      </>
                    ) : (
                      'No group'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Lower section shows activity and comments
  return (
    <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
      style={{ 
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
      }}
    >
      <div className="relative z-10">
        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
              <History className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Activity</h2>
              <p className="text-zinc-400 mt-1">Task history and comments</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Activity Timeline */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Timeline</h3>
              <div className="space-y-4">
                {isLoadingActivities ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-zinc-400">Loading activities...</span>
                    </div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <History className="w-4 h-4" />
                      <span>Created on {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  activities.map(activity => (
                    <div 
                      key={activity.id}
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        {getActivityIcon(activity.actionType)}
                        <span className="text-zinc-400">
                          {formatActivityText(activity)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getActivityIcon(type: TaskActivity['actionType']) {
  switch (type) {
    case 'status_change':
      return <Clock className="w-4 h-4 text-orange-400" />
    case 'priority_change':
      return <Tag className="w-4 h-4 text-blue-400" />
    case 'title_change':
    case 'description_change':
      return <Pencil className="w-4 h-4 text-zinc-400" />
    case 'assigned_to_change':
      return <UserIcon className="w-4 h-4 text-purple-400" />
    default:
      return <History className="w-4 h-4 text-zinc-400" />
  }
}

function formatActivityText(activity: TaskActivity): string {
  switch (activity.actionType) {
    case 'status_change':
      return `Status changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'priority_change':
      return `Priority changed from "${activity.previousValue}" to "${activity.newValue}"`
    case 'title_change':
      return `Title updated from "${activity.previousValue}" to "${activity.newValue}"`
    case 'description_change':
      return `Description updated`
    case 'assigned_to_change':
      return `Assignment changed from ${activity.previousValue} to ${activity.newValue}`
    default:
      return 'Task updated'
  }
}

interface CommentsSectionProps {
  task: Task
}

function CommentsSection({ task }: CommentsSectionProps) {
  const { session } = useSupabaseSession()
  const [comments, setComments] = useState<TaskComment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, 'adding' | 'editing' | 'deleting'>>({})

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      if (!session) return
      try {
        const data = await taskCommentsService.getComments(task.id, session)
        setComments(data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()
  }, [task.id, session])

  // Add comment
  const handleAddComment = async () => {
    if (!session || !newComment.trim()) return

    setLoadingStates(prev => ({ ...prev, new: 'adding' }))
    try {
      const comment = await taskCommentsService.createComment({
        taskId: task.id,
        content: newComment
      }, session)
      setComments(prev => [...prev, comment])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoadingStates(prev => {
        const { new: _, ...rest } = prev
        return rest
      })
    }
  }

  // Update comment
  const handleUpdateComment = async (comment: TaskComment) => {
    if (!session || !editingComment) return

    setLoadingStates(prev => ({ ...prev, [comment.id]: 'editing' }))
    try {
      const updatedComment = await taskCommentsService.updateComment(editingComment, session)
      setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c))
      setEditingComment(null)
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setLoadingStates(prev => {
        const { [comment.id]: _, ...rest } = prev
        return rest
      })
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!session) return

    setLoadingStates(prev => ({ ...prev, [commentId]: 'deleting' }))
    try {
      await taskCommentsService.deleteComment(commentId, session)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setLoadingStates(prev => {
        const { [commentId]: _, ...rest } = prev
        return rest
      })
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-400 mb-2">Comments</h3>
      
      {/* Add Comment */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px] bg-black/20 border-white/[0.05] focus:border-white/20 resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loadingStates['new'] === 'adding'}
            className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            {loadingStates['new'] === 'adding' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Comment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="mt-4 space-y-4">
        {isLoadingComments ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-zinc-400 py-4">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
            >
              {editingComment?.id === comment.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editingComment.content}
                    onChange={(e) => setEditingComment({
                      ...editingComment,
                      content: e.target.value
                    })}
                    className="min-h-[60px] bg-black/20 border-white/[0.05] focus:border-white/20 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingComment(null)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment)}
                      disabled={loadingStates[comment.id] === 'editing'}
                      className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
                    >
                      {loadingStates[comment.id] === 'editing' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="text-sm text-zinc-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {comment.userId === session?.user.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingComment(comment)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={loadingStates[comment.id] === 'deleting'}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          {loadingStates[comment.id] === 'deleting' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 