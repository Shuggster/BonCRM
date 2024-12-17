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

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => void
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      status,
      priority,
      dueDate,
      taskGroupId
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-background rounded-lg shadow-lg">
        <div className="flex">
          <div className="flex-1 p-6 border-r border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            
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

          {task && (
            <div className="w-[400px] p-6 max-h-[80vh] overflow-y-auto">
              <TaskComments 
                taskId={task.id}
                session={session}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 