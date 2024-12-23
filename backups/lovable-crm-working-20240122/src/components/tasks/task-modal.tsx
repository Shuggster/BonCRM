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
import { taskCalendarService } from '@/lib/supabase/services/task-calendar'
import { CalendarEvent } from '@/types/calendar'
import { EventModal } from '@/components/calendar/event-modal'

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

  const [linkedEvents, setLinkedEvents] = useState<CalendarEvent[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

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

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (!task?.id) return

      // Ensure all required fields are present
      const cleanEventData: Partial<CalendarEvent> = {
        ...eventData,
        description: eventData.description || '',
        category: eventData.category || 'task',
        start: eventData.start || new Date(),
        end: eventData.end || new Date(Date.now() + 3600000),
        assigned_to: eventData.assigned_to || null,
        assigned_to_type: eventData.assigned_to_type || null,
        department: eventData.department || null
      }

      console.log('Creating event with data:', cleanEventData)

      const event = selectedEvent
        ? await taskCalendarService.updateEventForTask(task.id, selectedEvent.id, cleanEventData)
        : await taskCalendarService.createEventForTask(task.id, cleanEventData, session)

      console.log('Event created/updated:', event)

      // Log activity for event changes
      try {
        await taskActivitiesService.logActivity({
          taskId: task.id,
          actionType: selectedEvent ? 'calendar_event_update' : 'calendar_event_create',
          previousValue: selectedEvent ? selectedEvent.title : null,
          newValue: event.title
        }, session)
      } catch (error) {
        console.error('Failed to log calendar event change:', error)
      }

      setLinkedEvents(prev => {
        const filtered = prev.filter(e => e.id !== event.id)
        return [...filtered, event]
      })
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

  const formattedDueDate = dueDate && dueDate instanceof Date 
    ? format(dueDate, "PPP") 
    : typeof dueDate === 'string' 
      ? format(new Date(dueDate), "PPP")
      : "Pick a date"

  const PriorityIcon = priorityIcons[priority]
  const StatusIcon = statusIcons[status]

  return (
    <>
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

                {/* Add Calendar Events Section */}
                {task && (
                  <div className="space-y-6 border-t border-white/10 pt-4 mt-6">
                    <div className="space-y-4">
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
                        <div className="space-y-2">
                          {linkedEvents.map(event => (
                            <div 
                              key={event.id}
                              className="flex items-center justify-between p-3 rounded-md bg-[#1C2333] border border-white/10"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-200 truncate">{event.title}</h4>
                                <p className="text-xs text-gray-400">
                                  {format(new Date(event.start), 'PPp')} - {format(new Date(event.end), 'PPp')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    setIsEventModalOpen(true)
                                  }}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
                                >
                                  <span className="sr-only">Edit</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                  </svg>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleUnlinkEvent(event.id)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                >
                                  <span className="sr-only">Unlink</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No events linked to this task</p>
                      )}
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