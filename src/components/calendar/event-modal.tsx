"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { CalendarEvent } from "@/types/calendar"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<CalendarEvent>) => void
  event?: CalendarEvent
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

interface RecurrenceRule {
  type: RecurrenceType
  interval: number
  endDate?: Date
}

export function EventModal({ isOpen, onClose, onSave, event }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [category, setCategory] = useState(event?.category || 'default')
  const [date, setDate] = useState<Date | null>(event?.start ? new Date(event.start) : null)
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    const eventData: Partial<CalendarEvent> = {
      title,
      description,
      category,
      start: date,
      end: date,
    }

    if (recurrence !== 'none') {
      eventData.recurrenceRule = {
        type: recurrence,
        interval: recurrenceInterval,
        endDate: recurrenceEndDate || undefined
      }
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Date & Time</label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded-md border border-white/10 bg-[#0F1629] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-400 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
              placeholderText="Select date and time"
              popperClassName="date-picker-popper"
              calendarClassName="date-picker-calendar"
              dayClassName={date => "hover:bg-white/10 rounded"}
              timeClassName={() => "text-white hover:bg-white/10"}
              wrapperClassName="date-picker-wrapper"
            />
            <style jsx global>{`
              .date-picker-popper {
                background: #0F1629 !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 0.5rem !important;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                font-family: ui-sans-serif, system-ui, sans-serif !important;
                margin-top: 8px !important;
              }
              .date-picker-calendar {
                background: #0F1629 !important;
                border: none !important;
                font-family: ui-sans-serif, system-ui, sans-serif !important;
                padding: 1rem !important;
              }
              .react-datepicker {
                display: flex !important;
                flex-direction: row !important;
                background: #0F1629 !important;
              }
              .react-datepicker__input-container input {
                color: white !important;
                background: #0F1629 !important;
              }
              .react-datepicker__time-container {
                border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
                width: 110px !important;
                margin-left: 0 !important;
              }
              .react-datepicker__time-container .react-datepicker__time {
                background: #0F1629 !important;
              }
              .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
                width: 110px !important;
                margin: 0 !important;
              }
              .react-datepicker__time-list {
                height: 264px !important;
                overflow-y: scroll !important;
                background: #0F1629 !important;
              }
              .react-datepicker__time-list::-webkit-scrollbar {
                width: 6px !important;
              }
              .react-datepicker__time-list::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05) !important;
                border-radius: 3px !important;
              }
              .react-datepicker__time-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2) !important;
                border-radius: 3px !important;
              }
              .react-datepicker__time-list-item {
                color: #E5E7EB !important;
                background: transparent !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 0.875rem !important;
                padding: 0 !important;
              }
              .react-datepicker__time-list-item:hover {
                background: rgba(255, 255, 255, 0.1) !important;
              }
              .react-datepicker__time-list-item--selected {
                background: rgba(255, 255, 255, 0.2) !important;
                font-weight: 600 !important;
              }
              .react-datepicker__header {
                background: #0F1629 !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                padding: 0.5rem !important;
              }
              .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
                padding: 0 !important;
              }
              .react-datepicker__current-month {
                color: #E5E7EB !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                margin-bottom: 0.5rem !important;
              }
              .react-datepicker__day-name {
                color: #9CA3AF !important;
                margin: 0.4rem !important;
                width: 2rem !important;
              }
              .react-datepicker__day {
                color: #E5E7EB !important;
                margin: 0.4rem !important;
                width: 2rem !important;
                height: 2rem !important;
                line-height: 2rem !important;
                border-radius: 9999px !important;
              }
              .react-datepicker__day:hover {
                background: rgba(255, 255, 255, 0.1) !important;
              }
              .react-datepicker__day--selected {
                background: rgba(255, 255, 255, 0.2) !important;
                font-weight: 600 !important;
              }
              .react-datepicker__day--keyboard-selected {
                background: rgba(255, 255, 255, 0.15) !important;
              }
              .react-datepicker__day--outside-month {
                color: #6B7280 !important;
              }
              .react-datepicker__navigation {
                top: 1rem !important;
              }
              .react-datepicker__navigation-icon::before {
                border-color: #9CA3AF !important;
              }
              .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                border-color: #E5E7EB !important;
              }
              .react-datepicker__time-container .react-datepicker__time {
                background: #0F1629 !important;
              }
            `}</style>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recurrence</label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="bg-white/5">
                <SelectValue placeholder="No recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence !== 'none' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Repeat every</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    className="bg-white/5 w-20"
                  />
                  <span className="text-sm">{recurrence}(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End recurrence</label>
                <DatePicker
                  selected={recurrenceEndDate}
                  onChange={(date) => setRecurrenceEndDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="w-full rounded-md border border-white/10 bg-[#0F1629] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-400 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholderText="Select end date (optional)"
                  minDate={date || undefined}
                  popperClassName="date-picker-popper"
                  calendarClassName="date-picker-calendar"
                  dayClassName={date => "hover:bg-white/10 rounded"}
                  wrapperClassName="date-picker-wrapper"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
