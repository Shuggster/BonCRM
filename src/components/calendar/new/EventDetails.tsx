"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { CalendarEvent } from "@/types/calendar"
import { Button } from "@/components/ui/button"
import { splitContentVariants } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  Building2,
  AlertCircle,
  Repeat,
  Phone,
  Mail,
  Video,
  MessageSquare,
  History,
  Edit,
  UserCircle,
  Users2,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { userService, DbUser } from "@/lib/supabase/services/users"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EventDetailsProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function EventDetails({ event, onClose, onEdit, onDelete }: EventDetailsProps) {
  const [assignedUser, setAssignedUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAssignedUser() {
      if (event.assigned_to) {
        try {
          const user = await userService.getUserById(event.assigned_to)
          setAssignedUser(user)
        } catch (error) {
          console.error('Error loading assigned user:', error)
        }
      }
      setLoading(false)
    }
    loadAssignedUser()
  }, [event.assigned_to])

  const getEventTypeIcon = () => {
    switch (event.type) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'meeting': return <Video className="h-4 w-4" />
      case 'follow_up': return <MessageSquare className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getPriorityColor = () => {
    switch (event.priority) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  const getStatusColor = () => {
    switch (event.status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-zinc-500/20 text-zinc-400'
    }
  }

  const formatRecurrencePattern = () => {
    if (!event.recurrence) return null
    
    const { frequency, interval = 1, endDate } = event.recurrence
    let pattern = `Repeats every ${interval} ${frequency}`
    if (interval > 1) pattern += 's'
    if (endDate) pattern += ` until ${format(new Date(endDate), 'MMMM d, yyyy')}`
    return pattern
  }

  return (
    <>
      <motion.div
        variants={splitContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full overflow-y-auto bg-[#111111] border-l border-white/[0.08]"
      >
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  {getEventTypeIcon()}
                  <span>{event.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="hover:bg-white/5"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="hover:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-4 w-4 mt-0.5 text-zinc-400" />
                <div>
                  <p className="font-medium">{format(new Date(event.start), 'MMMM d, yyyy')}</p>
                  <p className="text-sm text-zinc-400">
                    {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                  </p>
                </div>
              </div>

              {/* Assigned To */}
              {!loading && (
                <div className="flex items-start gap-3">
                  <UserCircle className="h-4 w-4 mt-0.5 text-zinc-400" />
                  <div>
                    <p className="font-medium">Assigned To</p>
                    <p className="text-sm text-zinc-400">
                      {assignedUser ? assignedUser.name : 'Not assigned'}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-zinc-400" />
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-zinc-400">{event.description}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="font-medium">Status</p>
                  <Badge variant="secondary" className={cn("mt-1", getStatusColor())}>
                    {event.status || 'Scheduled'}
                  </Badge>
                </div>
              </div>

              {/* Priority */}
              {event.priority && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="font-medium">Priority</p>
                    <Badge variant="secondary" className={cn("mt-1", getPriorityColor())}>
                      {event.priority}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Recurrence */}
              {event.recurrence && (
                <div className="flex items-start gap-3">
                  <Repeat className="h-4 w-4 mt-0.5 text-zinc-400" />
                  <div>
                    <p className="font-medium">Recurrence</p>
                    <p className="text-sm text-zinc-400">{formatRecurrencePattern()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
} 