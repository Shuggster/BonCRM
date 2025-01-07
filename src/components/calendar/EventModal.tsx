'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CalendarEvent } from '@/types/calendar'
import { format } from 'date-fns'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void
  initialData?: CalendarEvent
  initialDate?: { start: Date; end: Date }
}

export function EventModal({ isOpen, onClose, onSave, initialData, initialDate }: EventModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [start, setStart] = useState(initialDate?.start || initialData?.start || new Date())
  const [end, setEnd] = useState(initialDate?.end || initialData?.end || new Date())
  const [location, setLocation] = useState(initialData?.location || '')
  const [department, setDepartment] = useState(initialData?.department || '')
  const [attendees, setAttendees] = useState<string[]>(initialData?.attendees || [])
  const [attendeeInput, setAttendeeInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
      setStart(initialData.start)
      setEnd(initialData.end)
      setLocation(initialData.location || '')
      setDepartment(initialData.department || '')
      setAttendees(initialData.attendees || [])
    } else if (initialDate) {
      setStart(initialDate.start)
      setEnd(initialDate.end)
    }
  }, [initialData, initialDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      start,
      end,
      location,
      department,
      attendees,
      user_id: '', // This will be set by the service
    })
  }

  const handleAddAttendee = () => {
    if (attendeeInput && !attendees.includes(attendeeInput)) {
      setAttendees([...attendees, attendeeInput])
      setAttendeeInput('')
    }
  }

  const handleRemoveAttendee = (attendee: string) => {
    setAttendees(attendees.filter(a => a !== attendee))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">Start</label>
              <Input
                type="datetime-local"
                value={format(start, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setStart(new Date(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400">End</label>
              <Input
                type="datetime-local"
                value={format(end, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setEnd(new Date(e.target.value))}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">Department</label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">Attendees</label>
            <div className="flex gap-2">
              <Input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Add attendee"
              />
              <Button type="button" onClick={handleAddAttendee}>
                Add
              </Button>
            </div>
            {attendees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attendees.map((attendee) => (
                  <div
                    key={attendee}
                    className="flex items-center gap-1 bg-zinc-800/50 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{attendee}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="text-zinc-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 