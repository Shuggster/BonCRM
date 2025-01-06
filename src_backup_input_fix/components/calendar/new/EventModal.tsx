"use client"

import { CalendarEvent } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { EditEventForm } from './EditEventForm'
import { CreateEventForm } from './CreateEventForm'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void
  initialData?: CalendarEvent
  initialDate?: { start: Date; end: Date }
}

export function EventModal({ isOpen, onClose, onSave, initialData, initialDate }: EventModalProps) {
  if (!isOpen) return null

  const cards = initialData 
    ? EditEventForm.createCards(
        initialData,
        async (data) => {
          await onSave(data)
          onClose()
        },
        onClose
      )
    : CreateEventForm.createCards(
        async (data) => {
          await onSave(data)
          onClose()
        },
        onClose,
        { start: initialDate?.start, end: initialDate?.end }
      )

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed inset-y-0 right-0 w-[400px]">
        <div className="h-full flex flex-col rounded-l-2xl bg-[#111111]">
          {cards.upperCard}
          {cards.lowerCard}
        </div>
      </div>
    </div>
  )
} 