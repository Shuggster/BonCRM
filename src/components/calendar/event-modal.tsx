"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TeamSelect } from "@/components/ui/team-select"
import { CalendarEvent, RecurrenceRule } from "@/types/calendar"
import { EVENT_CATEGORIES, EventCategory } from "@/lib/constants/categories"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { addMinutes } from 'date-fns'
import { Session } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => void
  event?: CalendarEvent | null
  session: Session
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

export function EventModal({ isOpen, onClose, onSave, event, initialData, session }: EventModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState<EventCategory>(initialData?.category as EventCategory || 'default')
  const [startDate, setStartDate] = useState<Date>(initialData?.start || new Date())
  const [endDate, setEndDate] = useState<Date>(initialData?.end || new Date())
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(initialData?.recurrence)
  const [assignedTo, setAssignedTo] = useState<string | null | undefined>(initialData?.assigned_to)
  const [assignedToType, setAssignedToType] = useState<'user' | 'team' | null | undefined>(initialData?.assigned_to_type)
  const [department, setDepartment] = useState<string | null | undefined>(initialData?.department)
  const [error, setError] = useState<string | null>(null)

  // Set default end time to 1 hour after start time when start time changes
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(addMinutes(startDate, 60))
    }
  }, [startDate])

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setCategory(event.category as EventCategory || 'default')
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      setRecurrence(event.recurrence)
      setAssignedTo(event.assigned_to)
      setAssignedToType(event.assigned_to_type)
      setDepartment(event.department)
    } else if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description)
      setCategory(initialData.category as EventCategory || 'default')
      setStartDate(initialData.start)
      setEndDate(initialData.end)
      setRecurrence(initialData.recurrence)
      setAssignedTo(initialData.assigned_to)
      setAssignedToType(initialData.assigned_to_type)
      setDepartment(initialData.department)
    }
    setError(null)
  }, [event, initialData])

  const handleAssignment = (selection: { type: 'user' | 'team', id: string, department?: string }) => {
    if (!selection || !selection.id) {
      setAssignedTo(null)
      setAssignedToType(null)
      setDepartment(null)
      return
    }

    setAssignedTo(selection.id)
    setAssignedToType(selection.type)
    setDepartment(selection.department || null)
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
      assigned_to: assignedTo || null,
      assigned_to_type: assignedToType || null,
      department: department || null
    })
  }

  // Safely access session properties with defaults
  const isAdmin = session?.user?.role === 'admin' || false
  const userDepartment = session?.user?.department || null

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
                      if (date) {
                        setStartDate(date)
                        setError(null)
                      }
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
                    placeholderText="Select start time"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-200">End Time</Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setEndDate(date)
                        setError(null)
                      }
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
                    placeholderText="Select end time"
                    minDate={startDate}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200">Assign To</Label>
                <div className="mt-1.5">
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
                </div>
                {!isAdmin && userDepartment && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    You can only assign to members of the {userDepartment} department
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-white/[0.08]">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
