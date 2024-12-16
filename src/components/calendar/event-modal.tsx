"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { CalendarEvent } from "@/types/calendar"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { addMinutes } from 'date-fns'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => void
  event?: CalendarEvent
  initialData?: { start: Date; end: Date }
}

export function EventModal({ isOpen, onClose, onSave, event, initialData }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [category, setCategory] = useState(event?.category || 'default')
  const [date, setDate] = useState<Date | null>(event?.start || initialData?.start || null)
  const [endDate, setEndDate] = useState<Date | null>(event?.end || initialData?.end || null)
  const [error, setError] = useState<string | null>(null)

  // Set default end time to 1 hour after start time when start time changes
  useEffect(() => {
    if (date && !endDate) {
      setEndDate(addMinutes(date, 60))
    }
  }, [date])

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setCategory(event.category || 'default')
      setDate(new Date(event.start))
      setEndDate(new Date(event.end))
    } else if (initialData) {
      setTitle('')
      setDescription('')
      setCategory('default')
      setDate(initialData.start)
      setEndDate(initialData.end)
    }
    setError(null)
  }, [event, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!date || !endDate) {
      setError('Please select both start and end times')
      return
    }

    if (endDate <= date) {
      setError('End time must be after start time')
      return
    }

    const eventData: Partial<CalendarEvent> = {
      title: title || 'Untitled Event',
      description,
      category,
      start: date,
      end: endDate
    }

    await onSave(eventData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0F1629]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/90">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="bg-white/5"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              className="bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white/5">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${category.bgClass}`} />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <DatePicker
                selected={date}
                onChange={(date) => {
                  setDate(date)
                  setError(null)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded-md border border-white/10 bg-[#0F1629] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-400 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
                placeholderText="Select start date and time"
                minDate={new Date()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date)
                  setError(null)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded-md border border-white/10 bg-[#0F1629] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-400 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
                placeholderText="Select end date and time"
                minDate={date || new Date()}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update' : 'Create'} Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
