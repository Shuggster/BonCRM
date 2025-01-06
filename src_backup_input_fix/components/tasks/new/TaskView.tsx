'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, Clock, CheckSquare, BarChart3, Pencil, 
  Users, Tag, MessageSquare, History, Loader2, User as UserIcon, X, Plus
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
  onEdit?: (task: Task) => void
}

export function TaskView({ task, section, onClose, onEdit }: TaskViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [users, setUsers] = useState<DbUser[]>([])
  const [taskGroups, setTaskGroups] = useState<{ id: string; name: string; color: string }[]>([])
  const { session } = useSupabaseSession()
  const supabase = createClientComponentClient()

  // Fetch users and task groups
  useEffect(() => {
    async function fetchData() {
      const [usersResponse, groupsResponse] = await Promise.all([
        supabase
          .from('users')
          .select('id, email, name')
          .order('name'),
        supabase
          .from('task_groups')
          .select('id, name, color')
          .order('name')
      ])
      
      if (!usersResponse.error && usersResponse.data) {
        setUsers(usersResponse.data)
      }
      
      if (!groupsResponse.error && groupsResponse.data) {
        console.log('Task Groups Fetched:', groupsResponse.data)
        setTaskGroups(groupsResponse.data)
      }
    }

    fetchData()
  }, [supabase])

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

  // Add log when component receives initial task
  useEffect(() => {
    console.log('Initial Task Data:', {
      task_group_id: task.task_group_id,
      task_groups: task.task_groups,
      full_task: task
    });
  }, [task]);

  // Log activity when task is updated
  const handleSaveChanges = async () => {
    if (!session || !onEdit) return

    console.log('Before Save - Task Data:', {
      task_group_id: editedTask.task_group_id,
      task_groups: editedTask.task_groups
    })

    console.log('Saving Task with Groups:', {
      task_group_id: editedTask.task_group_id,
      task_groups: editedTask.task_groups,
      original_group_id: task.task_group_id,
      original_groups: task.task_groups
    })

    // Check what fields have changed and log activities
    if (editedTask.title !== task.title) {
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'title_change',
        previousValue: task.title,
        newValue: editedTask.title
      }, session)
    }

    if (editedTask.status !== task.status) {
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'status_change',
        previousValue: task.status,
        newValue: editedTask.status
      }, session)
    }

    if (editedTask.priority !== task.priority) {
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'priority_change',
        previousValue: task.priority,
        newValue: editedTask.priority
      }, session)
    }

    if (editedTask.description !== task.description) {
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'description_change',
        previousValue: task.description,
        newValue: editedTask.description
      }, session)
    }

    if (editedTask.assigned_to !== task.assigned_to) {
      const previousUser = users.find(u => u.id === task.assigned_to)
      const newUser = users.find(u => u.id === editedTask.assigned_to)
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'assigned_to_change',
        previousValue: previousUser ? (previousUser.name || previousUser.email) : 'Unassigned',
        newValue: newUser ? (newUser.name || newUser.email) : 'Unassigned'
      }, session)
    }

    if (editedTask.task_group_id !== task.task_group_id) {
      const previousGroup = taskGroups.find(g => g.id === task.task_group_id)
      const newGroup = taskGroups.find(g => g.id === editedTask.task_group_id)
      await taskActivitiesService.logActivity({
        taskId: task.id,
        actionType: 'group_change',
        previousValue: previousGroup ? previousGroup.name : 'No group',
        newValue: newGroup ? newGroup.name : 'No group'
      }, session)
    }

    // Call onEdit with updated task
    const updatedTask = {
      ...task,
      title: editedTask.title,
      description: editedTask.description,
      priority: editedTask.priority,
      status: editedTask.status,
      due_date: editedTask.due_date,
      assigned_to: editedTask.assigned_to,
      task_group_id: editedTask.task_group_id,
      task_groups: editedTask.task_groups
    }
    console.log('Sending Updated Task:', updatedTask);
    
    await onEdit(updatedTask)
    console.log('After Save - Updated Task Sent');
    
    setIsEditing(false)
  }

  // Add log when editedTask state changes
  useEffect(() => {
    console.log('EditedTask State Changed:', {
      task_group_id: editedTask.task_group_id,
      task_groups: editedTask.task_groups
    });
  }, [editedTask]);

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
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-lg px-3 py-2 text-2xl font-semibold"
                  />
                ) : (
                  <h2 className="text-2xl font-semibold">{task.title}</h2>
                )}
                <p className="text-zinc-400 mt-1">Task Details</p>
              </div>
              {onEdit && (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedTask(task) // Reset to original task data
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
                        onClick={handleSaveChanges}
                      >
                        <Plus className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Task Status and Priority */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                </div>
                <div className="mt-1">
                  {isEditing ? (
                    <Select
                      value={editedTask.status}
                      onValueChange={(value) => setEditedTask({ ...editedTask, status: value as "todo" | "in-progress" | "completed" })}
                    >
                      <SelectTrigger className="w-full bg-zinc-800/50 border-white/[0.08]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-white/[0.08]">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-zinc-400">Priority</h3>
                </div>
                <div className="mt-1">
                  {isEditing ? (
                    <Select
                      value={editedTask.priority}
                      onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as "low" | "medium" | "high" })}
                    >
                      <SelectTrigger className="w-full bg-zinc-800/50 border-white/[0.08]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-white/[0.08]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority} priority
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div className="mt-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Description</h3>
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                  {isEditing ? (
                    <textarea
                      value={editedTask.description || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm">{task.description || 'No description provided.'}</p>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/70">Due Date</div>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal bg-[#111111] border-white/10',
                            !editedTask.due_date && 'text-white/60'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-white/70" />
                          {editedTask.due_date ? format(new Date(editedTask.due_date), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <MiniCalendar
                          selectedDate={editedTask.due_date ? new Date(editedTask.due_date) : new Date()}
                          onDateSelect={(date) => setEditedTask({ ...editedTask, due_date: date.toISOString().split('T')[0] })}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="mt-1 text-sm">
                      {task.due_date ? format(new Date(task.due_date), 'PPP') : 'No due date'}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Group */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/70">Task Group</div>
                  {isEditing ? (
                    <Select
                      value={editedTask.task_group_id || "no-group"}
                      onValueChange={(value) => {
                        const newGroupId = value === 'no-group' ? null : value;
                        const groupDetails = newGroupId ? taskGroups.find(g => g.id === newGroupId) : undefined;
                        setEditedTask({
                          ...editedTask,
                          task_group_id: newGroupId,
                          task_groups: groupDetails
                        });
                      }}
                    >
                      <SelectTrigger className="w-full bg-zinc-800/50 border-white/[0.08]">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-white/[0.08]">
                        <SelectItem value="no-group">No group</SelectItem>
                        {taskGroups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: group.color }}
                              />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 text-sm flex items-center gap-2">
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
                  )}
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

            {/* Comments Section */}
            <CommentsSection task={task} />
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