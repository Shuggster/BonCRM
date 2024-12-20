"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TaskComment } from "@/types/comments"
import { Session } from "@supabase/supabase-js"
import { taskCommentsService } from "@/lib/supabase/services/task-comments"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from 'sonner'
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription'

interface TaskCommentsProps {
  taskId: string
  session: Session
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

export function TaskComments({ taskId, session }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: 'editing' | 'deleting' | null
  }>({})

  useEffect(() => {
    loadComments()
  }, [taskId])

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const data = await taskCommentsService.getComments(taskId, session)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newComment.trim() || isLoading) return

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
  }, [newComment, isLoading, taskId, session])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmitComment()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmitComment])

  const handleUpdateComment = async (comment: TaskComment) => {
    if (!editingComment || !editingComment.content.trim()) return

    setLoadingStates(prev => ({ ...prev, [comment.id]: 'editing' }))
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
      setLoadingStates(prev => ({ ...prev, [comment.id]: null }))
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setLoadingStates(prev => ({ ...prev, [commentId]: 'deleting' }))
    try {
      await taskCommentsService.deleteComment(commentId, session)
      setComments(comments.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setLoadingStates(prev => ({ ...prev, [commentId]: null }))
    }
  }

  const handleRealtimeInsert = useCallback((payload: any) => {
    const newComment = payload.new as TaskComment
    setComments(prev => [...prev, newComment])
  }, [])

  const handleRealtimeDelete = useCallback((payload: any) => {
    const deletedComment = payload.old as TaskComment
    setComments(prev => prev.filter(c => c.id !== deletedComment.id))
  }, [])

  useRealtimeSubscription('task_comments', 'INSERT', handleRealtimeInsert)
  useRealtimeSubscription('task_comments', 'DELETE', handleRealtimeDelete)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">Comments</h3>
        </div>
        {comments.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {comments.length} comment{comments.length !== 1 && 's'}
          </span>
        )}
      </div>

      {isLoadingComments ? (
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="group flex gap-3">
              <div className="flex-1">
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
                        disabled={loadingStates[comment.id] === 'editing'}
                      >
                        {loadingStates[comment.id] === 'editing' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <p className="text-sm">{comment.content}</p>
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
                              disabled={loadingStates[comment.id] === 'deleting'}
                            >
                              {loadingStates[comment.id] === 'deleting' ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
  )
} 