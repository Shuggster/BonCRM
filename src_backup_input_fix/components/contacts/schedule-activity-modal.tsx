"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, X, Phone, Mail, Users, ArrowRight } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { activityCalendarService } from "@/lib/supabase/services/activity-calendar"
import { UserSession } from "@/types/users"
import { useSession } from "next-auth/react"

interface ScheduleActivityModalProps {
  contact: {
    id: string
    name: string
  } | null
  isOpen: boolean
  onClose: () => void
  onActivityScheduled?: () => void
}

export function ScheduleActivityModal({
  contact,
  isOpen,
  onClose,
  onActivityScheduled
}: ScheduleActivityModalProps) {
  const { data: nextAuthSession } = useSession()
  const [title, setTitle] = useState("")
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'follow_up'>('call')
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState<Date | null>(new Date())
  const [duration, setDuration] = useState(30) // Default 30 minutes
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug log when component mounts or props change
  console.log('ScheduleActivityModal props:', {
    contactId: contact?.id,
    contactName: contact?.name,
    isOpen,
    hasSession: !!nextAuthSession,
    sessionUserId: nextAuthSession?.user?.id
  })

  const handleScheduleActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted')
    console.log('Form data:', {
      title,
      activityType,
      notes,
      scheduledFor,
      duration,
      contactId: contact?.id,
      sessionUserId: nextAuthSession?.user?.id
    })
    setSaving(true)
    setError(null)
    
    try {
      if (!nextAuthSession?.user) {
        console.error('No session found')
        throw new Error('No user session found')
      }

      // Convert NextAuth session to UserSession
      const session: UserSession = {
        user: {
          id: nextAuthSession.user.id,
          email: nextAuthSession.user.email,
          name: nextAuthSession.user.name,
          role: nextAuthSession.user.role,
          department: nextAuthSession.user.department
        }
      }

      // Validate required fields
      if (!contact?.id) {
        console.error('No contact ID')
        throw new Error('Contact ID is required')
      }
      if (!scheduledFor) {
        console.error('No schedule date')
        throw new Error('Please select a date and time')
      }
      if (!title.trim()) {
        console.error('No title')
        throw new Error('Please enter a title for the activity')
      }
      if (!activityType) {
        console.error('No activity type')
        throw new Error('Please select an activity type')
      }

      console.log('All validation passed, creating activity...')
      const result = await activityCalendarService.createActivityWithEvent(session, {
        title: title.trim(),
        type: activityType,
        description: notes.trim() || undefined,
        contact_id: contact.id,
        scheduled_for: scheduledFor,
        duration_minutes: duration
      })
      console.log('Activity created successfully:', result)

      // Trigger calendar refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('calendar:refresh'))

      // Clear form and close
      setTitle('')
      setActivityType('call')
      setNotes('')
      setScheduledFor(new Date())
      setDuration(30)
      if (onActivityScheduled) {
        onActivityScheduled()
      }
      onClose()
    } catch (err: any) {
      console.error('Error scheduling activity:', err)
      setError(err?.message || 'Failed to schedule activity')
    } finally {
      setSaving(false)
    }
  }

  const activityColors = {
    call: 'text-green-400',
    email: 'text-blue-400',
    meeting: 'text-purple-400',
    follow_up: 'text-orange-400'
  }

  if (!contact || !isOpen) return null

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'email':
        return <Mail className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'meeting':
        return <Users className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      default:
        return <ArrowRight className={`w-5 h-5 ${activityColors['follow_up']}`} />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl"
            >
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Schedule Activity</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleScheduleActivity} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity title"
                    required
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 ${
                      error?.includes('title') ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {error?.includes('title') && (
                    <p className="mt-1 text-sm text-red-400">Please enter a title for the activity</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['call', 'email', 'meeting', 'follow_up'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActivityType(type as any)}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-lg border
                          ${type === activityType
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-600 hover:border-gray-500'
                          }
                        `}
                      >
                        {getActivityIcon(type)}
                        <span className="text-xs capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Schedule For
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        selected={scheduledFor}
                        onChange={(date) => setScheduledFor(date)}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                        min="5"
                        max="480"
                        step="5"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Duration in minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or details..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? 'Scheduling...' : 'Schedule Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
