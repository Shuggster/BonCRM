'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { CalendarEvent } from '@/types/calendar'
import { addMinutes, format } from 'date-fns'
import { Bell, Calendar, Clock } from 'lucide-react'

interface ReminderFormProps {
  event?: CalendarEvent
  onSubmit: (reminder: {
    eventId?: string
    title: string
    description: string
    time: Date
    notifyBefore: number
  }) => void
  onCancel: () => void
}

interface ReminderFormData {
  title: string
  description: string
  date: string
  time: string
  notifyBefore: number
}

// Upper card with basic info
export function ReminderUpperCard({ 
  formData, 
  setFormData,
  event 
}: { 
  formData: ReminderFormData
  setFormData: (fn: (prev: ReminderFormData) => ReminderFormData) => void
  event?: CalendarEvent
}) {
  return (
    <div className="h-full rounded-t-2xl bg-[#111111] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          {event ? 'Set Event Reminder' : 'Create New Reminder'}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Title
          </label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-white/[0.02] border-white/10 text-white"
            placeholder={event ? event.title : "Reminder title"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40"
            placeholder={event ? event.description : "Reminder description"}
            rows={3}
          />
        </div>

        {event && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Event Date</span>
              </div>
              <div className="text-sm text-white">
                {format(new Date(event.start), 'PPP')}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Event Time</span>
              </div>
              <div className="text-sm text-white">
                {format(new Date(event.start), 'p')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Lower card with reminder settings
export function ReminderLowerCard({ 
  formData, 
  setFormData,
  onSubmit,
  onCancel,
  event
}: { 
  formData: ReminderFormData
  setFormData: (fn: (prev: ReminderFormData) => ReminderFormData) => void
  onSubmit: (reminder: {
    eventId?: string
    title: string
    description: string
    time: Date
    notifyBefore: number
  }) => void
  onCancel: () => void
  event?: CalendarEvent
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reminderTime = new Date(`${formData.date}T${formData.time}`)
    onSubmit({
      eventId: event?.id,
      title: formData.title,
      description: formData.description,
      time: reminderTime,
      notifyBefore: formData.notifyBefore
    })
  }

  return (
    <div className="h-full rounded-b-2xl bg-[#111111] border-t border-white/[0.08] p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Date
            </label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-white/[0.02] border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Time
            </label>
            <Input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="bg-white/[0.02] border-white/10 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Notify Before
          </label>
          <select
            value={formData.notifyBefore}
            onChange={(e) => setFormData(prev => ({ ...prev, notifyBefore: Number(e.target.value) }))}
            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value={5}>5 minutes before</option>
            <option value={10}>10 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={120}>2 hours before</option>
            <option value={1440}>1 day before</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Bell className="w-4 h-4" />
            <span className="text-sm">
              {formData.notifyBefore < 60 
                ? `${formData.notifyBefore} minutes before`
                : formData.notifyBefore === 60
                ? '1 hour before'
                : formData.notifyBefore === 120
                ? '2 hours before'
                : '1 day before'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              variant="default"
            >
              Set Reminder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReminderForm({ event, onSubmit, onCancel }: ReminderFormProps) {
  const defaultTime = event 
    ? new Date(event.start)
    : addMinutes(new Date(), 30)

  const [formData, setFormData] = useState<ReminderFormData>({
    title: event?.title || '',
    description: event?.description || '',
    date: format(defaultTime, 'yyyy-MM-dd'),
    time: format(defaultTime, 'HH:mm'),
    notifyBefore: 15
  })

  return (
    <form className="h-full">
      <ReminderUpperCard 
        formData={formData} 
        setFormData={setFormData}
        event={event}
      />
      <ReminderLowerCard 
        formData={formData} 
        setFormData={setFormData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        event={event}
      />
    </form>
  )
} 