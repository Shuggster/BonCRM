"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TeamSelect } from "@/components/ui/team-select"
import { CalendarEvent, RecurrenceRule, RecurrenceFrequency } from "@/types/calendar"
import { EVENT_CATEGORIES, EventCategory } from "@/lib/constants/categories"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { addMinutes } from 'date-fns'
import { UserSession } from '@/types/users'
import { cn } from '@/lib/utils'

interface AssignmentSelection {
  type: 'user' | 'team'
  id: string
  department?: string
}

interface EventFormData {
  title: string
  description: string
  category: EventCategory
  start: Date
  end: Date
  recurrence?: RecurrenceRule
  assigned_to?: string
  assigned_to_type?: 'user' | 'team'
  department?: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => void
  onDelete?: (event: CalendarEvent) => void
  event?: CalendarEvent | null
  session: UserSession
  initialData?: {
    title: string
    description: string
    category: string
    start: Date
    end: Date
    recurrence?: RecurrenceRule
    assigned_to?: string
    assigned_to_type?: 'user' | 'team'
    department?: string
  }
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, initialData, session }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EventCategory>('default')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addMinutes(new Date(), 60))
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>()
  const [assignedTo, setAssignedTo] = useState<string | undefined>()
  const [assignedToType, setAssignedToType] = useState<'user' | 'team' | undefined>()
  const [department, setDepartment] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Debug logs at the start of the component
  console.log('EventModal Render:', {
    event,
    hasEvent: !!event,
    hasOnDelete: !!onDelete,
    showDeleteButton: !!event && !!onDelete,
    eventId: event?.id,
    eventTitle: event?.title,
    eventType: event ? typeof event : 'undefined'
  })

  // Set default end time to 1 hour after start time when start time changes
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(addMinutes(startDate, 60))
    }
  }, [startDate, endDate])

  // Reset form when event or initialData changes
  useEffect(() => {
    if (event) {
      // If we have an event, use its data
      setTitle(event.title)
      setDescription(event.description || '')
      setCategory(event.category as EventCategory || 'default')
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      setRecurrence(event.recurrence)
      setAssignedTo(event.assigned_to)
      setAssignedToType(event.assigned_to_type)
      setDepartment(event.department)
    } else {
      // Reset form for new event
      setTitle('')
      setDescription('')
      setCategory('default')
      setStartDate(new Date())
      setEndDate(addMinutes(new Date(), 60))
      setRecurrence(undefined)
      setAssignedTo(undefined)
      setAssignedToType(undefined)
      setDepartment(undefined)
    }
    setError(null)
  }, [event])

  const handleDateChange = (date: Date | null, field: 'start' | 'end') => {
    if (date) {
      if (field === 'start') {
        setStartDate(date)
        // If end date is before new start date, adjust it
        if (endDate < date) {
          setEndDate(addMinutes(date, 60))
        }
      } else {
        setEndDate(date)
      }
      setError(null)
    }
  }

  const handleAssignment = (selection: AssignmentSelection) => {
    if (!selection || !selection.id) {
      setAssignedTo(undefined)
      setAssignedToType(undefined)
      setDepartment(undefined)
      return
    }

    setAssignedTo(selection.id)
    setAssignedToType(selection.type)
    setDepartment(selection.department)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!startDate || !endDate) {
      setError('Please select both start and end times')
      return
    }

    if (endDate <= startDate) {
      setError('End time must be after start time')
      return
    }

    onSave({
      title,
      description,
      category,
      start: startDate,
      end: endDate,
      recurrence,
      assigned_to: assignedTo,
      assigned_to_type: assignedToType,
      department
    })
  }

  const handleDelete = useCallback(async () => {
    if (event && onDelete) {
      console.log('Deleting event:', {
        id: event.id,
        title: event.title,
        isRecurring: event.isRecurring,
        originalEventId: event.originalEventId
      })

      try {
        await onDelete(event)
        onClose()
      } catch (error) {
        console.error('Error deleting event:', error)
        setError('Failed to delete event')
      }
    }
  }, [event, onDelete, onClose])

  // Safely access session properties with defaults
  const isAdmin = session?.user?.role === 'admin' || false
  const userDepartment = session?.user?.department || undefined

  // Debug logs
  console.log('Event Modal Props:', { 
    hasEvent: !!event,
    hasOnDelete: !!onDelete,
    showDeleteButton: !!event && !!onDelete,
    eventId: event?.id,
    eventTitle: event?.title
  })

  // If no session, show loading or error state
  if (!session?.user) {
    return null // Or loading state if preferred
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0F1629]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/90 border-white/[0.08] shadow-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {event ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-200">Title</Label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={cn(
                    "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                    "bg-[#1C2333] border-white/[0.08]",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                    "placeholder:text-gray-400"
                  )}
                  placeholder="Event title"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={cn(
                    "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                    "bg-[#1C2333] border-white/[0.08]",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                    "placeholder:text-gray-400",
                    "resize-none"
                  )}
                  placeholder="Event description"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className={cn(
                    "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                    "bg-[#1C2333] border-white/[0.08]",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  )}
                >
                  {Object.entries(EVENT_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-200">Start Time</Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => {
                      handleDateChange(date, 'start')
                    }}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={cn(
                      "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                      "bg-[#1C2333] border-white/[0.08]",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                      "placeholder:text-gray-400"
                    )}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-200">End Time</Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => {
                      handleDateChange(date, 'end')
                    }}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={cn(
                      "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                      "bg-[#1C2333] border-white/[0.08]",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
                      "placeholder:text-gray-400"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Recurrence Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableRecurrence"
                    checked={!!recurrence}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRecurrence({ frequency: 'daily' })
                      } else {
                        setRecurrence(undefined)
                      }
                    }}
                    className="rounded border-white/[0.08] bg-[#1C2333]"
                  />
                  <Label htmlFor="enableRecurrence" className="text-sm font-medium text-gray-200">
                    Repeat Event
                  </Label>
                </div>

                {recurrence && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Frequency</Label>
                      <select
                        value={recurrence.frequency}
                        onChange={(e) => setRecurrence({ ...recurrence, frequency: e.target.value as RecurrenceFrequency })}
                        className={cn(
                          "mt-1.5 w-full rounded-md border px-3 py-2 text-sm",
                          "bg-[#1C2333] border-white/[0.08]",
                          "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        )}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-200">Repeat Every</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={recurrence.interval || 1}
                          onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) || 1 })}
                          className={cn(
                            "mt-1.5 w-24 rounded-md border px-3 py-2 text-sm",
                            "bg-[#1C2333] border-white/[0.08]",
                            "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          )}
                        />
                        <span className="text-sm text-gray-400">
                          {recurrence.frequency === 'daily' && 'days'}
                          {recurrence.frequency === 'weekly' && 'weeks'}
                          {recurrence.frequency === 'monthly' && 'months'}
                          {recurrence.frequency === 'yearly' && 'years'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-200">Ends</Label>
                      <div className="mt-1.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="noEnd"
                            checked={!recurrence.endDate}
                            onChange={() => setRecurrence({ ...recurrence, endDate: undefined })}
                            className="border-white/[0.08] bg-[#1C2333]"
                          />
                          <Label htmlFor="noEnd" className="text-sm text-gray-400">Never</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="hasEnd"
                            checked={!!recurrence.endDate}
                            onChange={() => setRecurrence({ ...recurrence, endDate: addMinutes(endDate, 0) })}
                            className="border-white/[0.08] bg-[#1C2333]"
                          />
                          <Label htmlFor="hasEnd" className="text-sm text-gray-400">On date</Label>
                          {recurrence.endDate && (
                            <DatePicker
                              selected={recurrence.endDate}
                              onChange={(date: Date | null) => {
                                if (date) {
                                  setRecurrence({ ...recurrence, endDate: date })
                                }
                              }}
                              dateFormat="MMMM d, yyyy"
                              className={cn(
                                "w-full rounded-md border px-3 py-2 text-sm",
                                "bg-[#1C2333] border-white/[0.08]",
                                "focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Assign To</Label>
                <div className="mt-1.5">
                  <TeamSelect
                    onSelect={handleAssignment}
                    defaultValue={
                      assignedTo && assignedToType
                        ? { id: assignedTo, type: assignedToType }
                        : undefined
                    }
                    includeTeams={true}
                    currentDepartment={session.user.department}
                    allowCrossDepartment={session.user.role === 'admin'}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-6 mt-6 border-t border-white/[0.08]">
              <div>
                {event && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className={cn(
                      "px-4 py-2 h-9",
                      "bg-red-600/10 hover:bg-red-600/20 text-red-500",
                      "transition-all duration-200"
                    )}
                  >
                    Delete Event
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className={cn(
                    "px-4 py-2 h-9",
                    "text-gray-400 hover:text-gray-300",
                    "hover:bg-white/5",
                    "transition-all duration-200"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "px-4 py-2 h-9",
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    "transition-all duration-200"
                  )}
                >
                  {event ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
