"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, X, TagIcon, AlertCircleIcon, UserIcon, MapPinIcon, RepeatIcon, CalendarIcon, Clock, Video, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventDetailsProps {
  event: CalendarEvent
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function EventDetails({ event, onClose, onEdit, onDelete }: EventDetailsProps) {
  const eventCategory = event.category || 'default'
  const category = eventCategory in EVENT_CATEGORIES ? eventCategory : 'default'
  const categoryData = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES]

  return (
    <>
      {/* Top Card */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{event.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <CalendarIcon className="h-4 w-4" />
          <span>{format(new Date(event.start), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
          </span>
        </div>

        {event.category && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 text-sm">
            <span className={cn(
              "w-2 h-2 rounded-full",
              categoryData.borderClass.replace('border-l-2', 'bg')
            )} />
            <span className="text-zinc-200 capitalize">{event.category}</span>
          </div>
        )}
      </div>

      {/* Bottom Card */}
      <div className="p-6 space-y-6 border-t border-white/[0.08]">
        {/* Description */}
        {event.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Description</h3>
            <p className="text-sm text-zinc-300">{event.description}</p>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4">
          {event.assigned_to && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-zinc-400">Assigned To</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <UserIcon className="w-4 h-4" />
                <span>{event.assigned_to}</span>
              </div>
            </div>
          )}
          {event.location && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-zinc-400">Location</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5"
            onClick={onEdit}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Edit Event
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5 text-red-400 hover:text-red-300"
            onClick={onDelete}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Event
            </span>
          </Button>
        </div>
      </div>
    </>
  )
} 