"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { Task } from "@/types/tasks"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { cn } from "@/lib/utils"
import { TaskComments } from './task-comments'
import { Session } from '@supabase/supabase-js'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { TaskActivities } from './task-activities'
import { taskActivitiesService } from '@/lib/supabase/services/task-activities'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  task?: Task
  groups: TaskGroup[]
  session: Session
}

export function TaskModal({ isOpen, onClose, onSave, task, groups, session }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>(task?.status || 'todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate)
  const [taskGroupId, setTaskGroupId] = useState<string | undefined>(task?.taskGroupId)

  // Reset form when task changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '')
      setDescription(task?.description || '')
      setStatus(task?.status || 'todo')
      setPriority(task?.priority || 'medium')
      setDueDate(task?.dueDate)
      setTaskGroupId(task?.taskGroupId)
    }
  }, [isOpen, task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Log changes before saving
      if (task) {
        // Status change
        if (status !== task.status) {
          await taskActivitiesService.logActivity({
            taskId: task.id,
            actionType: 'status_change',
            previousValue: task.status,
            newValue: status
          }, session)
        }

        // Priority change
        if (priority !== task.priority) {
          await taskActivitiesService.logActivity({
            taskId: task.id,
            actionType: 'priority_change',
            previousValue: task.priority,
            newValue: priority
          }, session)
        }

        // Title change
        if (title !== task.title) {
          await taskActivitiesService.logActivity({
            taskId: task.id,
            actionType: 'title_change',
            previousValue: task.title,
            newValue: title
          }, session)
        }

        // Group change
        if (taskGroupId !== task.taskGroupId) {
          await taskActivitiesService.logActivity({
            taskId: task.id,
            actionType: 'group_change',
            previousValue: task.taskGroupId,
            newValue: taskGroupId
          }, session)
        }
      }

      // Save task
      await onSave({
        title,
        description,
        status,
        priority,
        dueDate,
        taskGroupId
      })
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6">
          {/* Left side - Task form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="todo"
                        checked={status === 'todo'}
                        onChange={(e) => setStatus(e.target.value as any)}
                      />
                      To Do
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="in-progress"
                        checked={status === 'in-progress'}
                        onChange={(e) => setStatus(e.target.value as any)}
                      />
                      In Progress
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="completed"
                        checked={status === 'completed'}
                        onChange={(e) => setStatus(e.target.value as any)}
                      />
                      Completed
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priority"
                        value="low"
                        checked={priority === 'low'}
                        onChange={(e) => setPriority(e.target.value as any)}
                      />
                      Low
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priority"
                        value="medium"
                        checked={priority === 'medium'}
                        onChange={(e) => setPriority(e.target.value as any)}
                      />
                      Medium
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priority"
                        value="high"
                        checked={priority === 'high'}
                        onChange={(e) => setPriority(e.target.value as any)}
                      />
                      High
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    onClick={() => setDueDate(dueDate || new Date())}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                  {dueDate && (
                    <DatePicker
                      selected={dueDate}
                      onChange={(date: Date | null) => setDueDate(date || undefined)}
                      dateFormat="MMMM d, yyyy"
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Group</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start gap-2",
                      !taskGroupId && "border-dashed"
                    )}
                    onClick={() => setTaskGroupId(undefined)}
                  >
                    <div 
                      className="h-3 w-3 rounded-full bg-transparent border-2"
                    />
                    No Group
                  </Button>
                  {groups.map((group) => (
                    <Button
                      key={group.id}
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start gap-2",
                        taskGroupId === group.id && "border-2"
                      )}
                      onClick={() => setTaskGroupId(group.id)}
                    >
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {task ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right side - Comments & Activities */}
          {task && (
            <div className="w-[400px] max-h-[700px] overflow-y-auto space-y-8 border-l border-border pl-6">
              <TaskComments 
                taskId={task.id}
                session={session}
              />
              <TaskActivities 
                taskId={task.id}
                session={session}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 