import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { format, isSameDay } from 'date-fns'
import { RefreshCw } from 'lucide-react'

interface DraggableEventProps {
  event: CalendarEvent
  onClick: () => void
  onDrop: (newStart: Date) => void
}

export function DraggableEvent({ event, onClick, onDrop }: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: event.id,
    data: event
  })

  console.log('DraggableEvent rendering:', {
    id: event.id,
    title: event.title,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    category: event.category,
    isDragging
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const isMultiDay = !isSameDay(event.start, event.end)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group flex items-center gap-2",
        "text-xs px-2 py-1 rounded-md",
        "bg-white/5 hover:bg-white/10 transition-colors",
        "border-l-2",
        `border-${event.category || 'blue'}-500`,
        isDragging && "ring-1 ring-purple-500 shadow-lg"
      )}
    >
      <div {...listeners} className="cursor-grab hover:cursor-grabbing">
        <div className="h-3 w-3 text-muted-foreground">⋮</div>
      </div>
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{event.title}</span>
          {event.recurrence && (
            <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(event.start, 'h:mm a')}
          {!isMultiDay && ` - ${format(event.end, 'h:mm a')}`}
          {isMultiDay && ' - Multiple days'}
        </div>
      </div>
    </div>
  )
} 