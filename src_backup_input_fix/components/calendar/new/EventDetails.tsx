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
          const users = await userService.getUsers()
          const user = users.find(u => u.id === event.assigned_to)
          setAssignedUser(user || null)
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
        variants={splitContentVariants.top}
        initial="initial"
        animate="animate"
        className="bg-[#111111] rounded-t-xl p-6"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">{event.title}</h2>
              <div className="flex items-center gap-2">
                {getEventTypeIcon()}
                <span className="text-sm text-zinc-400 capitalize">{event.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEdit}
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="z-50">
                    <p>Edit Event</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onDelete}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="z-50">
                    <p>Delete Event</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <span className="text-xl">×</span>
              </Button>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn("capitalize", getStatusColor())}>
              {event.status}
            </Badge>
            <Badge variant="outline" className={cn("capitalize", getPriorityColor())}>
              {event.priority} priority
            </Badge>
            {event.recurrence && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                <Repeat className="h-3 w-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
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
          </div>

          {/* Category */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5">
            <span className={cn(
              "w-2 h-2 rounded-full",
              event.category === 'task' && "bg-emerald-500",
              event.category === 'meeting' && "bg-blue-500",
              event.category === 'reminder' && "bg-amber-500",
              event.category === 'deadline' && "bg-red-500"
            )} />
            <span className="text-zinc-200 capitalize">{event.category}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={splitContentVariants.bottom}
        initial="initial"
        animate="animate"
        className="bg-[#111111] rounded-b-xl border-t border-white/[0.08] p-6"
      >
        <ScrollArea className="h-[calc(100%-88px)]">
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">Description</h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <Separator className="bg-white/[0.08]" />

            {/* Assignment & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  {event.assigned_to_type === 'team' ? (
                    <Users2 className="h-4 w-4" />
                  ) : (
                    <UserCircle className="h-4 w-4" />
                  )}
                  <h3 className="text-sm font-medium">Assigned To</h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-300">
                    {loading ? 'Loading...' : (
                      <>
                        {assignedUser?.name || 'Unassigned'}
                        {event.assigned_to_type && (
                          <span className="text-zinc-500 ml-1">
                            ({event.assigned_to_type})
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Building2 className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Department</h3>
                </div>
                <p className="text-sm text-zinc-300">{event.department || 'Not specified'}</p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <>
                <Separator className="bg-white/[0.08]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Location</h3>
                  </div>
                  <p className="text-sm text-zinc-300">{event.location}</p>
                </div>
              </>
            )}

            {/* Recurrence Details */}
            {event.recurrence && (
              <>
                <Separator className="bg-white/[0.08]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Repeat className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Recurrence</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-300">{formatRecurrencePattern()}</p>
                    {event.recurrence.exception_dates?.length > 0 && (
                      <div className="text-sm text-zinc-500">
                        <span>Except: </span>
                        {event.recurrence.exception_dates.map((date, i) => (
                          <span key={date}>
                            {format(new Date(date), 'MMM d, yyyy')}
                            {i < event.recurrence!.exception_dates!.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5"
                onClick={onEdit}
              >
                Edit Event
              </Button>
              <Button
                variant="outline"
                className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5 text-red-400 hover:text-red-300"
                onClick={onDelete}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </>
  )
} 