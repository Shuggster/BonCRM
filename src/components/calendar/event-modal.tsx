"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TeamSelect } from "@/components/ui/team-select"
import { CalendarEvent, RecurrenceRule } from "@/types/calendar"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { addMinutes } from 'date-fns'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
  const [category, setCategory] = useState(initialData?.category || 'default')
  const [startDate, setStartDate] = useState<Date>(initialData?.start || new Date())
  const [endDate, setEndDate] = useState<Date>(initialData?.end || new Date())
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(initialData?.recurrence)
  const [assignedTo, setAssignedTo] = useState<string | null | undefined>(initialData?.assigned_to)
  const [assignedToType, setAssignedToType] = useState<'user' | 'team' | null | undefined>(initialData?.assigned_to_type)
  const [department, setDepartment] = useState<string | null | undefined>(initialData?.department)
  const [error, setError] = useState<string | null>(null)

  // Get current user's department from session
  const [userDepartment, setUserDepartment] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

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
      setCategory(event.category || 'default')
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      setRecurrence(event.recurrence)
      setAssignedTo(event.assigned_to)
      setAssignedToType(event.assigned_to_type)
      setDepartment(event.department)
    } else if (initialData) {
      setTitle('')
      setDescription('')
      setCategory('default')
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
    // If selection is empty or invalid, clear all assignment fields
    if (!selection || !selection.id) {
      console.log('Clearing assignment fields');
      setAssignedTo(null)
      setAssignedToType(null)
      setDepartment(null)
      return
    }

    console.log('Assignment selection received:', selection);
    setAssignedTo(selection.id)
    setAssignedToType(selection.type)
    setDepartment(selection.department || null)
    console.log('State after setting:', { assignedTo, assignedToType, department });
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

    // Log the data we're about to send
    console.log('Event data being sent:', {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] max-h-[90vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="default">Default</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
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
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>

            <div>
              <Label>End Time</Label>
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
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
                required
                minDate={startDate}
              />
            </div>
          </div>

          <div>
            <Label>Assign To</Label>
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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
