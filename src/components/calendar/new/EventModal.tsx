"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import { format } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'

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
  const [category, setCategory] = useState(initialData?.category || 'default')
  const [start] = useState(initialData?.start || initialDate?.start || new Date())
  const [end] = useState(initialData?.end || initialDate?.end || new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      category,
      start,
      end,
      type: initialData?.type || '',
      contact_id: initialData?.contact_id,
      duration: initialData?.duration,
      color: initialData?.color,
      recurrence: initialData?.recurrence,
      is_recurring: initialData?.is_recurring,
      user_id: initialData?.user_id || ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed inset-y-0 right-0 w-[400px]">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="h-full flex flex-col rounded-l-2xl bg-[#111111]">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Upper Section - Basic Info */}
              <motion.div
                key="upper"
                className="flex-none"
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
                <div className="relative rounded-tl-2xl overflow-hidden" 
                     style={{ 
                       background: '#111111',
                       borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
                     }}>
                  <div className="relative z-10 p-8">
                    <div className="flex items-start justify-between mb-6">
                      <h2 className="text-2xl font-semibold">
                        {initialData ? 'Edit Event' : 'New Event'}
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-white/50">Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1 bg-[#111111]"
                          placeholder="Enter event title"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/50">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-1 w-full bg-[#111111] rounded-lg border border-white/10 p-2 text-sm"
                        >
                          {Object.entries(EVENT_CATEGORIES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lower Section - Additional Details */}
              <motion.div
                key="lower"
                className="flex-1 min-h-0"
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
                <div className="relative rounded-bl-2xl overflow-hidden" 
                     style={{ 
                       background: '#111111',
                       borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
                     }}>
                  <div className="relative z-10 p-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-white/50">Description</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 min-h-[100px] bg-[#111111]"
                          placeholder="Add event description..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-white/50">Start</label>
                          <div className="mt-1 text-white/90">
                            {format(start, 'PPp')}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-white/50">End</label>
                          <div className="mt-1 text-white/90">
                            {format(end, 'PPp')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 bg-[#111111] border-t border-white/10 rounded-bl-2xl">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1a1a1a] hover:bg-[#222] text-white"
                >
                  {initialData ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 