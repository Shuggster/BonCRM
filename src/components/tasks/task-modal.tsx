"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, CheckCircle2, Circle, AlertTriangle, Flag, Tag, User, Users } from "lucide-react"
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
import { TeamSelect } from "@/components/ui/team-select"
import { supabase } from '@/lib/supabase/client'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  task?: Task
  groups: TaskGroup[]
  session: Session
}

const priorityIcons = {
  low: Flag,
  medium: AlertTriangle,
  high: AlertTriangle
}

const priorityColors = {
  low: "text-blue-400",
  medium: "text-yellow-400",
  high: "text-red-400"
}

const statusIcons = {
  'todo': Circle,
  'in-progress': Clock,
  'completed': CheckCircle2
}

export function TaskModal({ isOpen, onClose, onSave, task, groups, session }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>(task?.status || 'todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate)
  const [taskGroupId, setTaskGroupId] = useState<string | undefined>(task?.taskGroupId)
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to)
  const [assignedToType, setAssignedToType] = useState(task?.assigned_to_type)
  const [assignedToDepartment, setAssignedToDepartment] = useState(task?.department)

  // Get current user's department from session
  const [userDepartment, setUserDepartment] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Reset form when task changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '')
      setDescription(task?.description || '')
      setStatus(task?.status || 'todo')
      setPriority(task?.priority || 'medium')
      setDueDate(task?.dueDate)
      setTaskGroupId(task?.taskGroupId)
      setAssignedTo(task?.assigned_to)
      setAssignedToType(task?.assigned_to_type)
      setAssignedToDepartment(task?.department)
    }
  }, [isOpen, task])

  // Fetch current user's department
  useEffect(() => {
    async function fetchUserDetails() {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('department, role')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setUserDepartment(data.department)
          setIsAdmin(data.role === 'admin')
        }
      }
    }
    fetchUserDetails()
  }, [session?.user?.id])

  const handleAssignment = (selection: { type: 'user' | 'team', id: string }) => {
    setAssignedTo(selection.id)
    setAssignedToType(selection.type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Log activity if status changed
    if (task && status !== task.status) {
      try {
        await taskActivitiesService.logActivity({
          taskId: task.id,
          actionType: 'status_change',
          previousValue: task.status,
          newValue: status
        }, session)
      } catch (error) {
        console.error('Failed to log status change:', error)
      }
    }

    // Log activity if priority changed
    if (task && priority !== task.priority) {
      try {
        await taskActivitiesService.logActivity({
          taskId: task.id,
          actionType: 'priority_change',
          previousValue: task.priority,
          newValue: priority
        }, session)
      } catch (error) {
        console.error('Failed to log priority change:', error)
      }
    }

    await onSave({
      title,
      description,
      status,
      priority,
      dueDate,
      taskGroupId,
      assigned_to: assignedTo,
      assigned_to_type: assignedToType,
      department: assignedToDepartment
    })
  }

  const formattedDueDate = dueDate && dueDate instanceof Date 
    ? format(dueDate, "PPP") 
    : typeof dueDate === 'string' 
      ? format(new Date(dueDate), "PPP")
      : "Pick a date"

  const PriorityIcon = priorityIcons[priority]
  const StatusIcon = statusIcons[status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-4 py-3 border-b border-white/10 sticky top-0 bg-[#0F1629] z-10">
          <DialogTitle className="text-lg font-medium text-gray-100">
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4">
            <div className="space-y-4">
              {/* Title & Description */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium text-gray-200">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 bg-[#1C2333] border-white/10 focus:border-blue-500 text-gray-100 placeholder:text-gray-500"
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-gray-200">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20 bg-[#1C2333] border-white/10 focus:border-blue-500 text-gray-100 placeholder:text-gray-500"
                  placeholder="Enter task description"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-200">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {['todo', 'in-progress', 'completed'].map((s) => {
                      const Icon = statusIcons[s as keyof typeof statusIcons]
                      return (
                        <Button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s as typeof status)}
                          variant={status === s ? 'default' : 'outline'}
                          className={cn(
                            "flex-1 gap-2 min-w-[80px] capitalize py-1.5 text-sm transition-all duration-200",
                            status === s 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-gray-200'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {s.replace('-', ' ')}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-200">Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    {['low', 'medium', 'high'].map((p) => {
                      const Icon = priorityIcons[p as keyof typeof priorityIcons]
                      return (
                        <Button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p as typeof priority)}
                          variant={priority === p ? 'default' : 'outline'}
                          className={cn(
                            "flex-1 gap-2 min-w-[80px] capitalize py-1.5 text-sm transition-all duration-200",
                            priority === p 
                              ? cn('bg-blue-600 hover:bg-blue-700 text-white',
                                  p === 'high' && 'bg-red-600 hover:bg-red-700',
                                  p === 'medium' && 'bg-yellow-600 hover:bg-yellow-700')
                              : 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-gray-200'
                          )}
                        >
                          <Icon className={cn("h-4 w-4", priority === p ? 'text-white' : priorityColors[p as keyof typeof priorityColors])} />
                          {p}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Due Date and Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-200">Due Date</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal transition-all duration-200",
                      "bg-[#1C2333] border-white/10 hover:bg-[#1C2333]/80",
                      !dueDate && "text-gray-500"
                    )}
                    onClick={() => document.getElementById('date-picker')?.click()}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {formattedDueDate}
                  </Button>
                  <DatePicker
                    id="date-picker"
                    selected={dueDate}
                    onChange={(date) => setDueDate(date || undefined)}
                    className="hidden"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-200">Group</Label>
                  <select
                    value={taskGroupId || ''}
                    onChange={(e) => setTaskGroupId(e.target.value || undefined)}
                    className={cn(
                      "w-full h-9 px-3 rounded-md transition-all duration-200",
                      "bg-[#1C2333] border border-white/10 focus:border-blue-500",
                      "text-gray-100 placeholder:text-gray-500"
                    )}
                  >
                    <option value="" className="bg-[#0F1629]">No Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id} className="bg-[#0F1629]">
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned" className="text-sm font-medium text-gray-200">Assigned To</Label>
                <TeamSelect
                  onSelect={handleAssignment}
                  defaultValue={assignedTo ? { 
                    type: assignedToType as 'user' | 'team', 
                    id: assignedTo 
                  } : undefined}
                  includeTeams={true}
                  currentDepartment={userDepartment || undefined}
                  allowCrossDepartment={isAdmin}
                />
                {!isAdmin && userDepartment && (
                  <p className="text-xs text-gray-400 mt-1">
                    You can only assign to members of the {userDepartment} department
                  </p>
                )}
              </div>

              {/* Comments & Activities */}
              {task && (
                <div className="space-y-6 border-t border-white/10 pt-4 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-200">Comments</h3>
                    <TaskComments taskId={task.id} session={session} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-200">Activity</h3>
                    <TaskActivities taskId={task.id} session={session} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="sticky bottom-0 bg-[#0F1629] px-4 py-3 border-t border-white/10">
            <div className="flex gap-3 max-w-[200px]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className={cn(
                  "flex-1 px-4 py-1.5 transition-all duration-200",
                  "border-white/10 hover:bg-white/5 text-gray-300 hover:text-gray-200"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn(
                  "flex-1 px-4 py-1.5 transition-all duration-200",
                  "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {task ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}