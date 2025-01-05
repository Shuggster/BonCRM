'use client'

import { CalendarEvent } from '@/types/calendar'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { EventCard } from './EventCard'
import { format } from 'date-fns'
import { X } from 'lucide-react'

interface FilteredEventsSplitViewProps {
  events: CalendarEvent[]
  title: string
  onClose: () => void
  onEventClick: (event: CalendarEvent) => void
}

export const FilteredEventsSplitView = {
  createCards: (
    events: CalendarEvent[],
    title: string,
    onClose: () => void,
    onEventClick: (event: CalendarEvent) => void
  ) => {
    const content = (
      <>
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
          className="h-full rounded-t-2xl bg-[#111111] p-6 border border-white/[0.08]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-zinc-400 mb-4">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </div>
        </motion.div>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
          className="h-full rounded-b-2xl bg-[#111111] p-6 border-t border-white/[0.08] overflow-auto"
        >
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                />
              ))
            ) : (
              <div className="text-center text-zinc-400 py-8">
                No events found
              </div>
            )}
          </div>
        </motion.div>
      </>
    )

    return {
      upperCard: content,
      lowerCard: null
    }
  }
} 