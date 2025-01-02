'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import { CalendarEvent, EventPriority, RecurringOptions } from '@/types/calendar'
import { EventCategory } from '@/lib/constants/categories'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/ui/multi-select'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from "@/components/ui/button"
import { TagIcon, AlertCircleIcon, UserIcon, MapPinIcon, RepeatIcon } from 'lucide-react'

const calendarClassName = cn(
  "rounded-md border border-white/10 bg-black p-3",
  "[&_table]:w-full",
  "[&_tr]:flex [&_tr]:justify-between",
  "[&_th]:flex [&_th]:h-8 [&_th]:w-8 [&_th]:items-center [&_th]:justify-center [&_th]:text-sm [&_th]:font-medium [&_th]:text-zinc-400",
  "[&_td]:p-0 [&_td]:text-center [&_td]:relative [&_td]:w-8",
  "[&_td]:[&>button]:w-8 [&_td]:[&>button]:h-8",
  "[&_td]:[&>button]:p-0 [&_td]:[&>button]:font-normal",
  "[&_td]:[&>button]:flex [&_td]:[&>button]:items-center [&_td]:[&>button]:justify-center",
  "[&_td]:[&>button]:hover:bg-white/5 [&_td]:[&>button]:text-white",
  "[&_td]:[&>button:disabled]:opacity-50 [&_td]:[&>button:disabled]:cursor-not-allowed",
  "[&_td]:[&>button[aria-selected]]:bg-white/10",
  "[&_.rdp-caption]:relative [&_.rdp-caption]:flex [&_.rdp-caption]:justify-center [&_.rdp-caption]:items-center [&_.rdp-caption]:pt-1",
  "[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-medium [&_.rdp-caption_label]:text-white",
  "[&_.rdp-nav]:flex [&_.rdp-nav]:items-center [&_.rdp-nav]:space-x-1",
  "[&_button.rdp-nav_button]:h-7 [&_button.rdp-nav_button]:w-7 [&_button.rdp-nav_button]:bg-black",
  "[&_button.rdp-nav_button]:border [&_button.rdp-nav_button]:border-white/10",
  "[&_button.rdp-nav_button]:p-0 [&_button.rdp-nav_button]:opacity-70 [&_button.rdp-nav_button]:hover:opacity-100",
  "[&_button.rdp-nav_button]:hover:bg-white/10 [&_button.rdp-nav_button]:rounded-md",
  "[&_button.rdp-nav_button>svg]:w-4 [&_button.rdp-nav_button>svg]:h-4 [&_button.rdp-nav_button>svg]:stroke-white",
  "[&_button.rdp-nav_button_previous]:absolute [&_button.rdp-nav_button_previous]:left-1",
  "[&_button.rdp-nav_button_next]:absolute [&_button.rdp-nav_button_next]:right-1"
)

interface EventFormContextType {
  formData: Omit<CalendarEvent, 'id'>
  setFormData: (data: Partial<Omit<CalendarEvent, 'id'>>) => void
  handleSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

const EventFormContext = createContext<EventFormContextType | null>(null)

function useEventForm(): EventFormContextType {
  const context = useContext(EventFormContext)
  if (!context) throw new Error('Event form components must be used within EventFormProvider')
  return context
}

interface EventFormProviderProps {
  children: React.ReactNode
  onSubmit: (data: Omit<CalendarEvent, 'id'>) => void
  onCancel: () => void
  initialData?: Partial<Omit<CalendarEvent, 'id'>>
}

function EventFormProvider({ children, onSubmit, onCancel, initialData }: EventFormProviderProps) {
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>(() => {
    // Create default dates
    const now = new Date()
    const defaultStart = initialData?.start ? new Date(initialData.start.getTime()) : now
    const defaultEnd = new Date(defaultStart.getTime())
    defaultEnd.setHours(defaultStart.getHours() + 1)

    // Create base event data
    const baseEvent: Omit<CalendarEvent, 'id'> = {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start: defaultStart,
      end: defaultEnd,
      category: (initialData?.category || 'meeting') as EventCategory,
      priority: initialData?.priority || 'medium',
      assigned_to: initialData?.assigned_to || '',
      assigned_to_type: initialData?.assigned_to_type || 'user',
      department: initialData?.department || '',
      user_id: initialData?.user_id || ''
    }

    return baseEvent
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateFormData = (data: Partial<Omit<CalendarEvent, 'id'>>) => {
    console.log('Form data updated:', data)
    setFormData(prev => {
      const updated = { ...prev, ...data }
      console.log('New form data:', updated)
      return updated
    })
  }

  const handleSubmit = () => {
    console.log('Submitting form data:', formData)
    setIsSubmitting(true)
    try {
      onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contextValue: EventFormContextType = {
    formData,
    setFormData: updateFormData,
    handleSubmit,
    isSubmitting,
    error
  }

  return (
    <EventFormContext.Provider value={contextValue}>
      {children}
    </EventFormContext.Provider>
  )
}

interface CreateEventFormProps {
  onSubmit: (data: Omit<CalendarEvent, 'id'>) => void
  onCancel: () => void
  defaultValues?: Partial<Omit<CalendarEvent, 'id'>>
}

function CalendarWithNav({ selected, onSelect, className }: { 
  selected: Date | undefined, 
  onSelect: (date: Date | undefined) => void,
  className?: string 
}) {
  return (
    <div className={cn("p-3 bg-black rounded-md", className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        initialFocus
        showOutsideDays={true}
        fixedWeeks={true}
      />
    </div>
  )
}

function TopSection() {
  const { formData, setFormData } = useEventForm()
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">Create New Event</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-zinc-400">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            className="mt-1 bg-black border-white/[0.08] text-white"
            placeholder="Event title"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-400">Description</label>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ description: e.target.value })}
            className="mt-1 bg-black border-white/[0.08] text-white"
            placeholder="Event description"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      "bg-black border-white/[0.08] text-white",
                      "hover:bg-white/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date)
                        newDate.setHours(formData.start.getHours())
                        newDate.setMinutes(formData.start.getMinutes())
                        setFormData({ start: newDate })
                      }
                    }}
                    initialFocus
                    className={calendarClassName}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium text-zinc-400">Start Time</label>
              <select
                value={`${formData.start.getHours().toString().padStart(2, '0')}:${formData.start.getMinutes().toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const newDate = new Date(formData.start)
                  newDate.setHours(hours)
                  newDate.setMinutes(minutes)
                  setFormData({ start: newDate })
                }}
                className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-black border-white/[0.08] text-white"
              >
                {Array.from({ length: 24 * 4 }).map((_, i) => {
                  const hours = Math.floor(i / 4)
                  const minutes = (i % 4) * 15
                  return (
                    <option 
                      key={i} 
                      value={`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}
                    >
                      {format(new Date().setHours(hours, minutes), 'h:mm a')}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      "bg-black border-white/[0.08] text-white",
                      "hover:bg-white/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.end, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date)
                        newDate.setHours(formData.end.getHours())
                        newDate.setMinutes(formData.end.getMinutes())
                        setFormData({ end: newDate })
                      }
                    }}
                    initialFocus
                    className={calendarClassName}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400">End Time</label>
              <select
                value={`${formData.end.getHours().toString().padStart(2, '0')}:${formData.end.getMinutes().toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const newDate = new Date(formData.end)
                  newDate.setHours(hours)
                  newDate.setMinutes(minutes)
                  setFormData({ end: newDate })
                }}
                className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-black border-white/[0.08] text-white"
              >
                {Array.from({ length: 24 * 4 }).map((_, i) => {
                  const hours = Math.floor(i / 4)
                  const minutes = (i % 4) * 15
                  return (
                    <option 
                      key={i} 
                      value={`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}
                    >
                      {format(new Date().setHours(hours, minutes), 'h:mm a')}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400">Duration Presets</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: '30 mins', duration: 30 },
              { label: '1 hour', duration: 60 },
              { label: '2 hours', duration: 120 },
              { label: 'All day', duration: 1440 }
            ].map(({ label, duration }) => (
              <Button
                key={duration}
                variant="outline"
                size="sm"
                className="bg-black border-white/[0.08] text-white hover:bg-white/5"
                onClick={() => {
                  const newEnd = new Date(formData.start)
                  newEnd.setMinutes(newEnd.getMinutes() + duration)
                  setFormData({ end: newEnd })
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function BottomSection({ onCancel }: { onCancel: () => void }) {
  const { formData, setFormData, handleSubmit, isSubmitting } = useEventForm()
  const [users, setUsers] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name')
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        if (!data) {
          console.error('No data returned from users query')
          return
        }
        setUsers(data)
      } catch (err) {
        console.error('Failed to load users:', err)
        setUsers([])
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const handleRecurringChange = (checked: boolean) => {
    if (checked) {
      setFormData({
        recurring: {
          frequency: 'daily',
          interval: 1,
          endDate: null,
          weekdays: []
        }
      })
    } else {
      setFormData({ recurring: undefined })
    }
  }

  const handleRecurringUpdate = (data: Partial<RecurringOptions>) => {
    if (!formData.recurring) return
    setFormData({
      recurring: {
        ...formData.recurring,
        ...data
      }
    })
  }
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ category: value as EventCategory })}
            >
              <SelectTrigger className={cn(
                "mt-1 bg-black border-white/[0.08] text-white",
                "hover:bg-white/5"
              )}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/[0.08]">
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4" />
              Priority
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ priority: value as EventPriority })}
            >
              <SelectTrigger className={cn(
                "mt-1 bg-black border-white/[0.08] text-white",
                "hover:bg-white/5"
              )}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/[0.08]">
                <SelectItem value="high" className="text-red-400">High Priority</SelectItem>
                <SelectItem value="medium" className="text-yellow-400">Medium Priority</SelectItem>
                <SelectItem value="low" className="text-green-400">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Assigned To
            </label>
            <Select
              value={formData.assigned_to || "unassigned"}
              onValueChange={(value) => setFormData({ 
                assigned_to: value === "unassigned" ? "" : value,
                assigned_to_type: 'user'
              })}
            >
              <SelectTrigger className={cn(
                "mt-1 bg-black border-white/[0.08] text-white",
                "hover:bg-white/5"
              )}>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/[0.08]">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {isLoadingUsers ? (
                  <SelectItem value="loading" disabled>Loading users...</SelectItem>
                ) : users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div>
          <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            Location
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Online Meeting</span>
              <Switch
                checked={formData.isOnline}
                onCheckedChange={(checked) => setFormData({ isOnline: checked })}
              />
            </div>

            {formData.isOnline ? (
              <Input
                value={formData.meetingLink || ''}
                onChange={(e) => setFormData({ meetingLink: e.target.value })}
                className="bg-black border-white/[0.08] text-white"
                placeholder="Meeting link (e.g. Zoom, Teams)"
              />
            ) : (
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ location: e.target.value })}
                className="bg-black border-white/[0.08] text-white"
                placeholder="Physical location"
              />
            )}
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <RepeatIcon className="h-4 w-4" />
              Recurring Event
            </label>
            <Switch
              checked={Boolean(formData.recurring)}
              onCheckedChange={handleRecurringChange}
            />
          </div>

          {formData.recurring && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/5">
              <div>
                <label className="text-sm font-medium text-zinc-400">Frequency</label>
                <Select
                  value={formData.recurring.frequency}
                  onValueChange={(value) => handleRecurringUpdate({
                    frequency: value as RecurringOptions['frequency']
                  })}
                >
                  <SelectTrigger className={cn(
                    "mt-1 bg-black border-white/[0.08] text-white",
                    "hover:bg-white/5"
                  )}>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-white/[0.08]">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400">Repeat Every</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="1"
                    value={formData.recurring.interval}
                    onChange={(e) => handleRecurringUpdate({
                      interval: parseInt(e.target.value) || 1
                    })}
                    className="w-24 bg-black border-white/[0.08] text-white"
                  />
                  <span className="text-sm text-zinc-400">
                    {formData.recurring.frequency === 'daily' && 'days'}
                    {formData.recurring.frequency === 'weekly' && 'weeks'}
                    {formData.recurring.frequency === 'monthly' && 'months'}
                    {formData.recurring.frequency === 'yearly' && 'years'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        "bg-black border-white/[0.08] text-white",
                        "hover:bg-white/5"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.recurring.endDate ? format(formData.recurring.endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border border-white/10" align="start">
                    <div className="p-3">
                      <Calendar
                        mode="single"
                        selected={formData.recurring?.endDate || undefined}
                        onSelect={(date) => handleRecurringUpdate({ endDate: date })}
                        initialFocus
                        className={calendarClassName}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export const CreateEventForm = {
  createCards: (
    onSubmit: (data: Omit<CalendarEvent, 'id'>) => void,
    onCancel: () => void,
    initialData?: Partial<Omit<CalendarEvent, 'id'>>
  ) => {
    const content = (
      <EventFormProvider onSubmit={onSubmit} onCancel={onCancel} initialData={initialData}>
        <>
          <motion.div
            key="event-upper"
            className="h-full rounded-t-2xl bg-[#111111] p-6"
            initial={{ y: "-100%" }}
            animate={{ 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 15
              }
            }}
          >
            <TopSection />
          </motion.div>
          <motion.div
            key="event-lower"
            className="h-full rounded-b-2xl bg-[#111111] border-t border-white/[0.08] p-6"
            initial={{ y: "100%" }}
            animate={{ 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 15
              }
            }}
          >
            <BottomSection onCancel={onCancel} />
          </motion.div>
        </>
      </EventFormProvider>
    )

    return {
      upperCard: content,
      lowerCard: null
    }
  }
} 