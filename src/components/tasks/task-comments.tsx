"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TaskComment, TaskActivity } from "@/types/comments"
import { Session } from "@supabase/supabase-js"
import { taskCommentsService } from "@/lib/supabase/services/task-comments"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Activity, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCommentsProps {
  taskId: string
  session: Session
}

export function TaskComments({ taskId, session }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [activities, setActivities] = useState<TaskActivity[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadComments()
    loadActivities()
  }, [taskId])

  const loadComments = async () => {
    try {
      const data = await taskCommentsService.getComments(taskId, session)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
    }
  }

  const loadActivities = async () => {
    try {
      const data = await taskCommentsService.getActivities(taskId, session)
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
      toast.error('Failed to load activities')
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const comment = await taskCommentsService.createComment({
        taskId,
        content: newComment.trim()
      }, session)
      setComments([...comments, comment])
      setNewComment("")
      toast.success('Comment added')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateComment = async (comment: TaskComment) => {
    if (!editingComment || !editingComment.content.trim()) return

    setIsLoading(true)
    try {
      const updatedComment = await taskCommentsService.updateComment({
        ...comment,
        content: editingComment.content.trim()
      }, session)
      setComments(comments.map(c => 
        c.id === updatedComment.id ? updatedComment : c
      ))
      setEditingComment(null)
      toast.success('Comment updated')
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast.error('Failed to update comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskCommentsService.deleteComment(commentId, session)
      setComments(comments.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const formatActivityMessage = (activity: TaskActivity) => {
    const userName = activity.user?.name || activity.user?.email || 'Unknown user'
    
    switch (activity.actionType) {
      case 'status_change':
        return `${userName} changed status from ${activity.previousValue} to ${activity.newValue}`
      case 'priority_change':
        return `${userName} changed priority from ${activity.previousValue} to ${activity.newValue}`
      case 'group_change':
        return `${userName} moved task to ${activity.newValue ? `group "${activity.newValue}"` : 'no group'}`
      case 'due_date_change':
        return `${userName} changed due date to ${activity.newValue ? new Date(activity.newValue).toLocaleDateString() : 'none'}`
      default:
        return `${userName} updated the task`
    }
  }

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">Comments</h3>
        </div>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="group flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {comment.user?.name?.[0] || comment.user?.email?.[0] || '?'}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-medium">
                      {comment.user?.name || comment.user?.email || 'Unknown user'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>

                  {comment.userId === session.user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem 
                          onClick={() => setEditingComment(comment)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {editingComment?.id === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingComment.content}
                      onChange={(e) => setEditingComment({
                        ...editingComment,
                        content: e.target.value
                      })}
                      className="min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingComment(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment)}
                        disabled={isLoading}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[60px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isLoading}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <h3 className="font-medium">Activity</h3>
        </div>

        <div className="space-y-2">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                {activity.user?.name?.[0] || activity.user?.email?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {formatActivityMessage(activity)}
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 