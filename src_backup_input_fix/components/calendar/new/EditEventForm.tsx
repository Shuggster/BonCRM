'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { splitContentVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { 
  Calendar as CalendarIcon,
  Save,
  TagIcon,
  AlertCircle,
  UserCircle,
  Building2,
  MapPin,
  Repeat,
  History
} from 'lucide-react'
import { userService, DbUser } from '@/lib/supabase/services/users'

interface EditEventFormContextType {
  formData: CalendarEvent
  setFormData: (data: Partial<CalendarEvent>) => void
  handleSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

const EditEventFormContext = createContext<EditEventFormContextType | null>(null)

function useEditEventForm() {
  const context = useContext(EditEventFormContext)
  if (!context) throw new Error('Edit event form components must be used within EditEventFormProvider')
  return context
}

interface EditEventFormProviderProps {
  children: React.ReactNode
  event: CalendarEvent
  onSave: (updatedEvent: CalendarEvent) => Promise<void>
  onCancel: () => void
}

function EditEventFormProvider({ children, event, onSave, onCancel }: EditEventFormProviderProps) {
  const [formData, setFormData] = useState<CalendarEvent>(event)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateFormData = (data: Partial<CalendarEvent>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (formData.end <= formData.start) {
        setError('End time must be after start time')
        return
      }
      await onSave(formData)
      onCancel()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EditEventFormContext.Provider value={{
      formData,
      setFormData: updateFormData,
      handleSubmit,
      isSubmitting,
      error
    }}>
      {children}
    </EditEventFormContext.Provider>
  )
}

function TopSection() {
  const { formData, setFormData, error } = useEditEventForm()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-white">Edit Event</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            className="mt-1 bg-black border-white/[0.08] text-white"
            placeholder="Event title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ status: value as any })}
            >
              <SelectTrigger className="bg-black border-white/[0.08] text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ priority: value as any })}
            >
              <SelectTrigger className="bg-black border-white/[0.08] text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ type: value as any })}
          >
            <SelectTrigger className="bg-black border-white/[0.08] text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <Input
              type="datetime-local"
              value={new Date(formData.start).toISOString().slice(0, 16)}
              onChange={(e) => setFormData({ start: new Date(e.target.value) })}
              className="bg-black/20 border-white/10 focus:border-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Input
              type="datetime-local"
              value={new Date(formData.end).toISOString().slice(0, 16)}
              onChange={(e) => setFormData({ end: new Date(e.target.value) })}
              className="bg-black/20 border-white/10 focus:border-white/20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomSection({ onCancel }: { onCancel: () => void }) {
  const { formData, setFormData, handleSubmit, isSubmitting } = useEditEventForm()
  const [users, setUsers] = useState<DbUser[]>([])

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await userService.getUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    loadUsers()
  }, [])

  return (
    <ScrollArea className="h-[calc(100%-88px)]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ description: e.target.value })}
            className="min-h-[100px] bg-black/20"
            placeholder="Add a description..."
          />
        </div>

        <Separator className="bg-white/[0.08]" />

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ category: value as any })}
          >
            <SelectTrigger className="bg-black border-white/[0.08] text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select
              value={formData.assigned_to || ''}
              onValueChange={(value) => setFormData({ 
                assigned_to: value,
                assigned_to_type: 'user'
              })}
            >
              <SelectTrigger className="bg-black border-white/[0.08] text-white">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department || ''}
              onValueChange={(value) => setFormData({ department: value })}
            >
              <SelectTrigger className="bg-black border-white/[0.08] text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.recurrence && (
          <>
            <Separator className="bg-white/[0.08]" />
            <div className="space-y-4">
              <Label>Recurrence</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={formData.recurrence.frequency}
                  onValueChange={(value) => setFormData({
                    recurrence: {
                      ...formData.recurrence!,
                      frequency: value as any
                    }
                  })}
                >
                  <SelectTrigger className="bg-black border-white/[0.08] text-white">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={formData.recurrence.interval || 1}
                  onChange={(e) => setFormData({
                    recurrence: {
                      ...formData.recurrence!,
                      interval: parseInt(e.target.value)
                    }
                  })}
                  className="bg-black/20 border-white/10 focus:border-white/20"
                  placeholder="Interval"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.recurrence.endDate ? new Date(formData.recurrence.endDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({
                    recurrence: {
                      ...formData.recurrence!,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    }
                  })}
                  className="bg-black/20 border-white/10 focus:border-white/20"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <History className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}

export const EditEventForm = {
  createCards: (
    event: CalendarEvent,
    onSave: (updatedEvent: CalendarEvent) => Promise<void>,
    onCancel: () => void
  ) => {
    const content = (
      <EditEventFormProvider event={event} onSave={onSave} onCancel={onCancel}>
        <>
          <motion.div
            variants={splitContentVariants.top}
            initial="initial"
            animate="animate"
            className="h-full rounded-t-2xl bg-[#111111] p-6"
          >
            <TopSection />
          </motion.div>
          <motion.div
            variants={splitContentVariants.bottom}
            initial="initial"
            animate="animate"
            className="h-full rounded-b-2xl bg-[#111111] border-t border-white/[0.08] p-6"
          >
            <BottomSection onCancel={onCancel} />
          </motion.div>
        </>
      </EditEventFormProvider>
    )

    return {
      upperCard: content,
      lowerCard: null
    }
  }
} 