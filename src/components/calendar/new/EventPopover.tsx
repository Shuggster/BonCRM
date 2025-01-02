'use client'

import { CalendarEvent } from "@/types/calendar"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface EventPopoverProps {
  event: CalendarEvent
  onEdit?: () => void
  onDelete?: () => void
}

export function EventPopover({ event, onEdit, onDelete }: EventPopoverProps) {
  return (
    <div className="p-4 space-y-4 min-w-[280px]">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">{event.title}</h3>
        <div className="text-sm text-zinc-400">{event.title}</div>
        <div className="text-sm text-zinc-400">
          {format(event.start, 'MMMM do, yyyy')} at {format(event.start, 'h:mm a')}
        </div>
        {event.category && (
          <div className="text-sm text-zinc-400">
            Category: {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </div>
        )}
      </div>

      <div className="pt-2 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start bg-black border-white/[0.08] hover:bg-white/5"
          onClick={onEdit}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Event
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start bg-black border-white/[0.08] hover:bg-white/5 text-red-400 hover:text-red-300"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Event
        </Button>
      </div>
    </div>
  )
} 