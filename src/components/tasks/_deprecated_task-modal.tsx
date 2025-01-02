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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskActivities } from './task-activities'
import { taskActivitiesService } from '@/lib/supabase/services/task-activities'
import { TeamSelect } from "@/components/ui/team-select"
import { supabase } from '@/lib/supabase/client'
import { taskCalendarService } from '@/lib/supabase/services/task-calendar'
import { CalendarEvent } from '@/types/calendar'
import { EventModal } from '@/components/calendar/event-modal'
import { convertToSupabaseSession } from "@/lib/utils/session"
import { Session as NextAuthSession } from "next-auth"
import { UserSession } from "@/types/users"
import { Session } from '@supabase/supabase-js'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => Promise<void>
  task?: Task
  groups: TaskGroup[]
  session: UserSession
}

export function TaskModal({ isOpen, onClose, onSave, task, groups, session }: TaskModalProps) {
  const [linkedEvents, setLinkedEvents] = useState<CalendarEvent[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const supabaseSession = convertToSupabaseSession(session)
  if (!supabaseSession) {
    console.error('No valid session')
    return null
  }

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>(
    task?.status || 'todo'
  )
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

  // Fetch linked events when task changes
  useEffect(() => {
    async function fetchLinkedEvents() {
      if (task?.id) {
        const events = await taskCalendarService.getEventsForTask(task.id)
        setLinkedEvents(events)
      }
    }
    fetchLinkedEvents()
  }, [task?.id])

  const handleAssignment = (selection: { type: 'user' | 'team', id: string, department?: string }) => {
    setAssignedTo(selection.id)
    setAssignedToType(selection.type)
    setAssignedToDepartment(selection.department || null)
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
        }, supabaseSession)
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
        }, supabaseSession)
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

  const handleCreateEvent = async () => {
    console.log('Create Event clicked')
    console.log('Session:', session)
    console.log('Task:', task)
    
    if (!task?.id) {
      console.error('No task ID - please save the task first')
      alert('Please save the task first before scheduling an event.')
      return
    }
    
    if (!session?.user) {
      console.error('No valid session user')
      return
    }
    
    setIsEventModalOpen(true)
  }

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (!task?.id || !supabaseSession) {
        console.error('Missing task ID or session:', { taskId: task?.id, hasSession: !!supabaseSession })
        return
      }

      // Ensure all required fields are present
      const cleanEventData: Partial<CalendarEvent> = {
        ...eventData,
        description: eventData.description || '',
        category: eventData.category || 'task',
        start: eventData.start || new Date(),
        end: eventData.end || new Date(Date.now() + 3600000),
        assigned_to: eventData.assigned_to || undefined,
        assigned_to_type: eventData.assigned_to_type || undefined,
        department: eventData.department || undefined
      }

      console.log('Creating event with data:', cleanEventData)

      const event = selectedEvent
        ? await taskCalendarService.updateEventForTask(task.id, selectedEvent.id, cleanEventData)
        : await taskCalendarService.createEventForTask(task.id, cleanEventData, supabaseSession)

      console.log('Event created/updated:', event)

      // Log activity for event changes
      try {
        await taskActivitiesService.logActivity({
          taskId: task.id,
          actionType: selectedEvent ? 'calendar_event_update' : 'calendar_event_create',
          previousValue: selectedEvent ? selectedEvent.title : null,
          newValue: event.title
        }, supabaseSession)
      } catch (error) {
        console.error('Failed to log calendar event change:', error)
      }

      // Refresh the linked events
      const events = await taskCalendarService.getEventsForTask(task.id)
      setLinkedEvents(events)
      
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleUnlinkEvent = async (eventId: string) => {
    try {
      if (!task?.id) return
      await taskCalendarService.unlinkEventFromTask(task.id, eventId)
      setLinkedEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Failed to unlink event:', error)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] md:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
          <DialogHeader className="px-6 py-4 border-b border-white/10">
            <DialogTitle className="text-xl font-medium">
              {task ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Main Details */}
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

                  {/* Assignment */}
                  <div className="space-y-3">
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
                </div>

                {/* Right Column - Task Details */}
                <div className="space-y-4">
                  {/* Due Date */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-200">Due Date</Label>
                    <DatePicker
                      selected={dueDate}
                      onChange={(date: Date | null) => setDueDate(date || undefined)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="flex h-9 w-full rounded-md border border-white/10 bg-[#1C2333] px-3 py-1 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
                      placeholderText="Select due date"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-200">Priority</Label>
                    <Select 
                      value={priority} 
                      onValueChange={(value: string) => setPriority(value as 'low' | 'medium' | 'high')}
                    >
                      <SelectTrigger className="h-9 bg-[#1C2333] border-white/10 focus:border-blue-500 text-gray-100">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C2333] border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-200">Status</Label>
                    <Select 
                      value={status} 
                      onValueChange={(value: string) => {
                        const statusMap = {
                          'todo': 'todo',
                          'in_progress': 'in-progress',
                          'done': 'completed'
                        } as const
                        setStatus(statusMap[value as keyof typeof statusMap])
                      }}
                    >
                      <SelectTrigger className="h-9 bg-[#1C2333] border-white/10 focus:border-blue-500 text-gray-100">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C2333] border-white/10">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group */}
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

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-200">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-[#1C2333] text-gray-200 hover:bg-[#1C2333]/80"
                        >
                          {tag}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                        className="h-8 w-24 bg-[#1C2333] border-white/10 focus:border-blue-500 text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments & Activities */}
              {task && (
                <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-200">Comments</h3>
                      <TaskComments taskId={task.id} session={session} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-200">Activity</h3>
                      <TaskActivities taskId={task.id} session={session} />
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Events Section */}
              {task && (
                <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-200">Calendar Events</h3>
                    <Button
                      type="button"
                      onClick={handleCreateEvent}
                      variant="outline"
                      className="text-sm border-white/10 hover:bg-white/5"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                  {linkedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {linkedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-md bg-[#1C2333] border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-200">{event.title}</p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(event.start), 'PPp')}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlinkEvent(event.id)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No events linked to this task</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="sticky bottom-0 bg-[#0F1629] px-6 py-4 border-t border-white/10">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={cn(
                    "px-4 py-2 transition-all duration-200",
                    "border-white/10 hover:bg-white/5 text-gray-300 hover:text-gray-200"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "px-4 py-2 transition-all duration-200",
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

      {/* Calendar Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        onSave={handleEventSave}
        event={selectedEvent}
        session={session}
        initialData={selectedEvent ? undefined : {
          title: task?.title || '',
          description: task?.description || '',
          category: 'task',
          start: new Date(),
          end: new Date(Date.now() + 3600000),
          assigned_to: task?.assigned_to || undefined,
          assigned_to_type: task?.assigned_to_type || undefined,
          department: task?.department || undefined
        }}
      />
    </>
  )
}