"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, X, Phone, Mail, Users, ArrowRight } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { supabase } from "@/lib/supabase"

interface ScheduleActivityModalProps {
  contact: {
    id: string
    name: string
  } | null
  isOpen: boolean
  onClose: () => void
  onActivityScheduled: () => void
}

export function ScheduleActivityModal({
  contact,
  isOpen,
  onClose,
  onActivityScheduled,
}: ScheduleActivityModalProps) {
  const [title, setTitle] = useState("")
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'follow_up'>('call')
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState<Date | null>(new Date())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('Modal props received:', JSON.stringify({
    contactId: contact?.id,
    contactName: contact?.name,
    isOpen
  }, null, 2))

  const handleScheduleActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('1. Starting activity scheduling...')
    setSaving(true)
    setError(null)
    
    try {
      // Temporarily hardcode a user ID for testing
      const user = { id: 'd1baaba0-29d4-4660-a8af-f371d31d028f' } // Hugh's user ID
      
      // Validate required fields
      if (!contact?.id) {
        throw new Error('Contact ID is required')
      }
      if (!scheduledFor) {
        throw new Error('Schedule date is required')
      }
      if (!title) {
        throw new Error('Title is required')
      }
      if (!activityType) {
        throw new Error('Activity type is required')
      }

      // Log the exact data we're sending
      console.log('Preparing activity with:', JSON.stringify({
        userId: user.id,
        contactId: contact?.id,
        title,
        activityType,
        scheduledFor: scheduledFor?.toISOString()
      }, null, 2))

      const activityData = {
        user_id: user.id,
        contact_id: contact.id,
        title: title.trim(),
        type: activityType,
        description: notes.trim() || null,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending'
      }
      console.log('2. Activity data prepared:', activityData)

      // First verify we can read from the table
      console.log('3. Testing table access...')
      const { error: testError } = await supabase
        .from('scheduled_activities')
        .select('id')
        .limit(1)

      if (testError) {
        console.log('4A. Test query failed:', {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint
        })
        throw testError
      }

      console.log('4B. Test query successful, proceeding with insert')

      // Then try to insert
      const response = await supabase
        .from('scheduled_activities')
        .insert(activityData)
        .select()
        .single()

      console.log('5. Insert response:', JSON.stringify({
        data: response.data,
        error: response.error,
        status: response.status
      }, null, 2))

      if (response.error) {
        console.log('6A. Insert failed:', JSON.stringify({
          code: response.error.code,
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint
        }, null, 2))
        throw response.error
      }

      console.log('6B. Insert successful:', response.data)

      // Clear form and close
      setTitle('')
      setActivityType('call')
      setNotes('')
      setScheduledFor(new Date())
      onActivityScheduled()
      onClose()
    } catch (err: any) {
      console.log('7. Error caught:', {
        error: err,
        type: typeof err,
        code: err?.code,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        status: err?.status
      })
      
      // Handle Supabase errors specifically
      if (err?.code) {
        switch (err.code) {
          case '42501':
            setError('Permission denied. Please check if you are logged in.')
            break
          case '23505':
            setError('This activity already exists.')
            break
          case 'PGRST301':
            setError('Database row not found.')
            break
          case '23503':
            setError('This action references invalid data.')
            break
          default:
            setError(err.message || 'Failed to schedule activity')
        }
      } else {
        setError(err?.message || 'An unexpected error occurred')
      }
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity title"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
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
                            : 'border-gray-700 hover:border-gray-600'
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
                    Date & Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={scheduledFor}
                      onChange={(date) => setScheduledFor(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                      calendarClassName="bg-gray-800 border border-gray-700 text-white rounded-lg shadow-xl"
                      wrapperClassName="w-full"
                      popperClassName="react-datepicker-popper"
                      customInput={
                        <div className="relative w-full">
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                            value={scheduledFor?.toLocaleString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                            readOnly
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or details..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
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
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-md"
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
