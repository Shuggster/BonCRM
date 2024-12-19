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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] max-h-[90vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-4 md:px-8 py-4 md:py-6 border-b border-white/10 sticky top-0 bg-[#0F1629] z-10">
          <DialogTitle className="text-xl font-medium">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-4 md:gap-8">
              {/* Left Column - Main Details */}
              <div className="space-y-4 md:space-y-6">
                {/* Title & Description */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-24 md:h-32 bg-[#1C2333] border-white/10 focus:border-blue-500"
                    placeholder="Enter task description"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {['todo', 'in-progress', 'completed'].map((s) => (
                        <Button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s as typeof status)}
                          variant={status === s ? 'default' : 'outline'}
                          className={cn(
                            "flex-1 min-w-[80px] capitalize py-1.5 text-sm",
                            status === s ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/10 hover:bg-white/5'
                          )}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="flex flex-wrap gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <Button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p as typeof priority)}
                          variant={priority === p ? 'default' : 'outline'}
                          className={cn(
                            "flex-1 min-w-[80px] capitalize py-1.5 text-sm",
                            priority === p ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/10 hover:bg-white/5'
                          )}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Due Date and Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Due Date</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-white/10",
                        !dueDate && "text-muted-foreground"
                      )}
                      onClick={() => document.getElementById('date-picker')?.click()}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                    <DatePicker
                      id="date-picker"
                      selected={dueDate}
                      onChange={(date) => setDueDate(date)}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Group</Label>
                    <select
                      value={taskGroupId || ''}
                      onChange={(e) => setTaskGroupId(e.target.value || undefined)}
                      className="w-full h-10 px-3 bg-[#1C2333] border border-white/10 rounded-md focus:border-blue-500"
                    >
                      <option value="">No Group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Comments & Activities */}
              <div className="space-y-6 mt-6 lg:mt-0">
                {task && (
                  <>
                    <div className="border-b border-white/10 pb-6">
                      <h3 className="text-lg font-medium mb-4">Comments</h3>
                      <TaskComments taskId={task.id} session={session} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Activity</h3>
                      <TaskActivities taskId={task.id} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="sticky bottom-0 bg-[#0F1629] px-4 md:px-8 py-4 border-t border-white/10 flex gap-3 sm:gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 sm:px-6 py-1.5 sm:py-2 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700"
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}