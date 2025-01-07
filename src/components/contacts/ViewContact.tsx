'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Contact, ContactTag, LeadStatus, LeadSource } from "@/types"
import { cn } from "@/lib/utils"
import { 
  Phone, Mail, Building2, Briefcase, 
  Calendar, Tags, ChevronDown,
  LineChart, FileText, Users,
  Globe, Linkedin, Twitter, MapPin,
  Video, Tag, Pencil, Facebook, MessageCircle,
  ArrowRight, X, Factory, Check,
  User, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { TagManagementModal } from '@/components/contacts/tag-management-modal'
import { TagStatisticsModal } from '@/components/contacts/tag-statistics-modal'
import { AssignTagsModal } from '@/components/contacts/AssignTagsModal'
import { IndustryManagementModal } from '@/components/contacts/industry-management-modal'
import { ContactNotes } from './ContactNotes'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { activityCalendarService } from "@/lib/supabase/services/activity-calendar"
import { useSession } from "next-auth/react"
import { UserSession } from "@/types/users"
import { User as DBUser } from "@/types/users"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ViewContactProps {
  contact: Contact
  section?: 'upper' | 'lower'
  onEdit?: () => void
  onRefresh?: () => void
}

const expandConfig = {
  initial: { height: 0, opacity: 0 },
  animate: { 
    height: "auto", 
    opacity: 1,
    transition: {
      height: {
        type: "spring",
        stiffness: 50,
        damping: 15
      },
      opacity: { duration: 0.2 }
    }
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: {
      height: {
        type: "spring",
        stiffness: 50,
        damping: 15
      },
      opacity: { duration: 0.2 }
    }
  }
}

interface ExpandableSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultExpanded?: boolean
}

function ExpandableSection({ title, icon: Icon, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="last:border-b-0 border-b border-white/[0.08]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-white">{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-zinc-400 transition-transform",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={expandConfig}
            className="relative overflow-visible"
          >
            <div className="px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ViewContact({ contact: initialContact, section = 'upper', onEdit, onRefresh }: ViewContactProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState(initialContact)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Update contact when initialContact changes
  useEffect(() => {
    setContact(initialContact)
  }, [initialContact])

  // Activity scheduling state
  const [title, setTitle] = useState("")
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'follow_up'>('call')
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date())
  const [duration, setDuration] = useState(30)
  const [assignedTo, setAssignedTo] = useState<string>('')
  
  const supabase = createClientComponentClient()

  const [users, setUsers] = useState<TeamAssignmentUser[]>([])
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([])

  console.log('ViewContact received contact:', {
    id: initialContact.id,
    name: `${initialContact.first_name} ${initialContact.last_name}`,
    industries: initialContact.industries,
    industry_id: initialContact.industry_id,
    full_contact: initialContact
  })

  useEffect(() => {
    const fetchActivities = async () => {
      if (!contact?.id) {
        console.log('No contact ID available for fetching activities')
        return
      }
      
      console.log('Fetching activities for contact:', contact.id)
      setLoadingActivities(true)
      try {
        // Fetch activities from the calendar API
        const response = await fetch(`/api/calendar/events?contact_id=${contact.id}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to fetch activities')
        }

        const activitiesData = await response.json()
        console.log('Fetched activities:', activitiesData)
        
        // Transform activities to match the expected format
        const formattedActivities = activitiesData.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          type: activity.type || 'calendar_event',
          description: activity.description,
          scheduled_for: activity.start,
          status: activity.status || 'scheduled',
          contact_id: contact.id,
          activity_calendar_relations: [{
            calendar_events: {
              id: activity.id,
              title: activity.title,
              description: activity.description,
              start_time: activity.start,
              end_time: activity.end
            }
          }]
        }))

        console.log('Formatted activities:', formattedActivities)
        setActivities(formattedActivities)
      } catch (err) {
        console.error('Error in fetchActivities:', err)
      } finally {
        setLoadingActivities(false)
      }
    }

    const fetchUsers = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, department')
          .order('name')
        
        if (error) throw error
        setUsers(users || [])
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_tags')
          .select('*')
          .order('name')

        if (error) {
          console.error('Failed to fetch tags:', error.message)
          return
        }

        setTags(data || [])
      } catch (err) {
        console.error('Error fetching tags:', err)
      }
    }

    fetchActivities()
    fetchUsers()
    fetchTags()
  }, [contact?.id, refreshKey])

  const handleScheduleActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      setError('No user session found')
      return
    }
    if (!scheduledFor) {
      setError('Please select a date and time')
      return
    }

    setSaving(true)
    setError(null)

    try {
      console.log('Creating activity for contact:', contact.id)
      
      // Create a minimal session object with just the required fields
      const userSession = {
        user: {
          id: session.user?.id || '',
          email: session.user?.email || '',
          department: session.user?.department || null
        }
      }

      await activityCalendarService.createActivityWithEvent(userSession as UserSession, {
        title: title.trim(),
        type: activityType,
        description: notes.trim() || undefined,
        contact_id: contact.id,
        scheduled_for: scheduledFor,
        duration_minutes: duration,
        assigned_to: assignedTo || session.user.id,
        assigned_to_type: 'user'
      })

      console.log('Activity created, fetching updated activities')

      // Clear form
      setTitle('')
      setActivityType('call')
      setNotes('')
      setScheduledFor(new Date())
      setDuration(30)
      setAssignedTo('')
      
      // Trigger a refresh of the activities list
      setRefreshKey(prev => prev + 1)
      
      // Refresh dashboard
      if (onRefresh) {
        onRefresh()
      }
    } catch (err: any) {
      console.error('Error scheduling activity:', err)
      setError(err?.message || 'Failed to schedule activity')
    } finally {
      setSaving(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const activityColors = {
      call: 'text-green-400',
      email: 'text-blue-400',
      meeting: 'text-purple-400',
      follow_up: 'text-orange-400'
    }

    switch (type) {
      case 'call':
        return <Phone className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'email':
        return <Mail className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'meeting':
        return <Video className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'follow_up':
        return <ArrowRight className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      default:
        return <ArrowRight className={`w-5 h-5 ${activityColors['follow_up']}`} />
    }
  }

  const renderActivities = () => {
    console.log('Rendering activities:', activities)

    if (loadingActivities) {
      return <div className="text-zinc-400 text-sm">Loading activities...</div>
    }

    if (!activities || activities.length === 0) {
      return <div className="text-zinc-400 text-sm">No activities scheduled</div>
    }

    return activities.map((activity) => {
      console.log('Rendering activity:', activity)
      const event = activity.activity_calendar_relations?.[0]?.calendar_events
      if (!event) {
        console.log('No calendar event found for activity:', activity.id)
        return null
      }

      return (
        <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/[0.05]">
          {getActivityIcon(activity.type)}
          <div className="flex-1">
            <h4 className="font-medium">{activity.title}</h4>
            <p className="text-sm text-zinc-400">
              {new Date(activity.scheduled_for).toLocaleString()}
              {activity.description && ` • ${activity.description}`}
              {activity.assigned_to && users.find(u => u.id === activity.assigned_to) && 
                ` • Assigned to ${users.find(u => u.id === activity.assigned_to)?.name}`}
            </p>
          </div>
          <div className="text-sm">
            <span className={cn(
              "px-2 py-1 rounded-full",
              activity.status === 'completed' ? "bg-green-500/20 text-green-400" :
              activity.status === 'cancelled' ? "bg-red-500/20 text-red-400" :
              "bg-blue-500/20 text-blue-400"
            )}>
              {activity.status}
            </span>
          </div>
        </div>
      )
    })
  }

  // Remove the test data merge since we're using real data now
  const initials = `${initialContact.first_name?.[0] || ""}${initialContact.last_name?.[0] || ""}`.toUpperCase()
  
  // Get a color based on the first letter (simplified version)
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-amber-500',
    'from-cyan-500 to-sky-500'
  ]
  const colorIndex = (initialContact.first_name?.charCodeAt(0) || 0) % gradients.length

  // Test data for social media
  const socialData = {
    website: initialContact.website || 'https://example.com',
    linkedin: initialContact.linkedin || 'https://linkedin.com/in/example',
    twitter: initialContact.twitter || 'example',
    facebook: initialContact.facebook || 'https://facebook.com/example',
    whatsapp: initialContact.whatsapp || '1234567890'
  }

  // Pipeline handlers with only local state updates
  const handleLeadStatusChange = async (value: LeadStatus) => {
    if (!contact?.id) return
    setSaving(true)
    setContact(prev => ({ ...prev, lead_status: value }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ lead_status: value })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating lead status:', err)
      setContact(prev => ({ ...prev, lead_status: initialContact.lead_status }))
    } finally {
      setSaving(false)
    }
  }

  const handleLeadSourceChange = async (value: LeadSource) => {
    if (!contact?.id) return
    setSaving(true)
    setContact(prev => ({ ...prev, lead_source: value }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ lead_source: value })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating lead source:', err)
      setContact(prev => ({ ...prev, lead_source: initialContact.lead_source }))
    } finally {
      setSaving(false)
    }
  }

  const handleLeadScoreChange = async (value: string) => {
    if (!contact?.id) return
    const score = parseInt(value)
    if (isNaN(score) || score < 0 || score > 100) return
    
    setSaving(true)
    setContact(prev => ({ ...prev, lead_score: score }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ lead_score: score })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating lead score:', err)
      setContact(prev => ({ ...prev, lead_score: initialContact.lead_score }))
    } finally {
      setSaving(false)
    }
  }

  const handleExpectedValueChange = async (value: string) => {
    if (!contact?.id) return
    const amount = parseFloat(value)
    if (isNaN(amount) || amount < 0) return
    
    setSaving(true)
    setContact(prev => ({ ...prev, expected_value: amount }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ expected_value: amount })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating expected value:', err)
      setContact(prev => ({ ...prev, expected_value: initialContact.expected_value }))
    } finally {
      setSaving(false)
    }
  }

  const handleProbabilityChange = async (value: string) => {
    if (!contact?.id) return
    const probability = parseInt(value)
    if (isNaN(probability) || probability < 0 || probability > 100) return
    
    setSaving(true)
    setContact(prev => ({ ...prev, probability: probability }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ probability: probability })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating probability:', err)
      setContact(prev => ({ ...prev, probability: initialContact.probability }))
    } finally {
      setSaving(false)
    }
  }

  const handleNextFollowUpChange = async (value: string) => {
    if (!contact?.id) return
    setSaving(true)
    setContact(prev => ({ ...prev, next_follow_up: value }))
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ next_follow_up: value })
        .eq('id', contact.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating next follow-up:', err)
      setContact(prev => ({ ...prev, next_follow_up: initialContact.next_follow_up }))
    } finally {
      setSaving(false)
    }
  }

  const handleAssignmentChange = async (userId: string) => {
    if (!contact?.id) return
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ 
          assigned_to: userId || null,
          assigned_to_type: userId ? 'user' : null 
        })
        .eq('id', contact.id)

      if (error) throw error
      
      // Update local state
      setContact(prev => ({ 
        ...prev, 
        assigned_to: userId || null,
        assigned_to_type: userId ? 'user' : null
      }))
    } catch (err) {
      console.error('Error updating assignment:', err)
      // Revert on error
      setContact(prev => ({ 
        ...prev, 
        assigned_to: initialContact.assigned_to,
        assigned_to_type: initialContact.assigned_to_type
      }))
    } finally {
      setSaving(false)
    }
  }

  // Upper section content
  if (section === 'upper') {
    return (
      <div className="rounded-t-2xl bg-[#111111] border-b border-white/[0.08]">
        {/* Main Contact Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Avatar/Initials */}
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white bg-gradient-to-br border border-white/10",
                gradients[colorIndex]
              )}>
                {initials}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">
                  {initialContact.first_name} {initialContact.last_name}
                </h2>
                {initialContact.job_title && (
                  <p className="text-sm text-white/60">{initialContact.job_title}</p>
                )}
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {initialContact.contact_tag_relations?.map((relation) => (
                    <div
                      key={relation.contact_tags.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
                      style={{ 
                        backgroundColor: `${relation.contact_tags.color}15`,
                        color: relation.contact_tags.color 
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {relation.contact_tags.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="flex gap-2 sm:self-start">
              <a 
                href={`tel:${initialContact.phone}`}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Call"
              >
                <Phone className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
              </a>
              <a 
                href={`https://meet.google.com/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Start video call"
              >
                <Video className="w-5 h-5 text-purple-500 group-hover:text-purple-400" />
              </a>
              <a 
                href={`mailto:${initialContact.email}`}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Send email"
              >
                <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
              </a>
              <div className="w-px h-6 my-auto bg-white/10" />
              <button 
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Edit contact"
              >
                <Pencil className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialContact.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Phone className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Phone</div>
                  <div className="text-white">{initialContact.phone}</div>
                </div>
              </div>
            )}
            {initialContact.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Email</div>
                  <div className="text-white">{initialContact.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable sections */}
        <div className="divide-y divide-white/[0.08]">
          <ExpandableSection title="Contact Details" icon={User}>
            {/* Company Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialContact.company && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Company</div>
                    <div className="text-white">{initialContact.company}</div>
                  </div>
                </div>
              )}
              {initialContact.department && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Department</div>
                    <div className="text-white">{initialContact.department}</div>
                  </div>
                </div>
              )}
              {initialContact.industries && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Factory className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Industry</div>
                    <div className="text-white">{initialContact.industries.name}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media & Web Links */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white/90 mb-4">Social & Web</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {socialData.website && (
                  <a 
                    href={socialData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <Globe className="w-5 h-5 text-[#2196F3]" />
                    <span className="text-sm text-white/90">
                      {(() => {
                        try {
                          return new URL(socialData.website).hostname
                        } catch {
                          return socialData.website
                        }
                      })()}
                    </span>
                  </a>
                )}
                {socialData.linkedin && (
                  <a 
                    href={socialData.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                    <span className="text-sm text-white/90">LinkedIn</span>
                  </a>
                )}
                {socialData.twitter && (
                  <a 
                    href={`https://twitter.com/${socialData.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    <span className="text-sm text-white/90">@{socialData.twitter}</span>
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {socialData.facebook && (
                  <a 
                    href={socialData.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-[#1877F2]" />
                    <span className="text-sm text-white/90">Facebook</span>
                  </a>
                )}
                {socialData.whatsapp && (
                  <a 
                    href={`https://wa.me/${socialData.whatsapp}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <span className="text-sm text-white/90">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6">
              <ContactNotes contactId={initialContact.id} />
            </div>
          </ExpandableSection>
          
          <ExpandableSection title="Address Information" icon={MapPin}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {initialContact.address_line1 && (
                  <div>
                    <div className="text-sm text-zinc-400">Address Line 1</div>
                    <div className="text-white">{initialContact.address_line1}</div>
                  </div>
                )}
                {initialContact.address_line2 && (
                  <div>
                    <div className="text-sm text-zinc-400">Address Line 2</div>
                    <div className="text-white">{initialContact.address_line2}</div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {initialContact.city && (
                    <div>
                      <div className="text-sm text-zinc-400">City</div>
                      <div className="text-white">{initialContact.city}</div>
                    </div>
                  )}
                  {initialContact.region && (
                    <div>
                      <div className="text-sm text-zinc-400">Region/State</div>
                      <div className="text-white">{initialContact.region}</div>
                    </div>
                  )}
                  {initialContact.postcode && (
                    <div>
                      <div className="text-sm text-zinc-400">Postal Code</div>
                      <div className="text-white">{initialContact.postcode}</div>
                    </div>
                  )}
                  {initialContact.country && (
                    <div>
                      <div className="text-sm text-zinc-400">Country</div>
                      <div className="text-white">{initialContact.country}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>
      </div>
    )
  }

  // Lower section content
  return (
    <div className="rounded-b-2xl bg-[#111111] border-t border-white/[0.08]">
      <div className="divide-y divide-white/[0.08]">
        <ExpandableSection title="Activities & Schedule" icon={Calendar} defaultExpanded={true}>
          <div className="p-6 space-y-6">
            {/* Activity Form */}
            <form onSubmit={handleScheduleActivity} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={activityType} onValueChange={(value) => setActivityType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity title..."
                    className="bg-black border-white/10 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule For</Label>
                  <DatePicker
                    selected={scheduledFor}
                    onChange={(date) => setScheduledFor(date || new Date())}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-md focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    min={15}
                    step={15}
                    className="bg-black border-white/10 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                    className="w-full h-24 px-3 py-2 bg-black border border-white/10 rounded-md focus:border-blue-500 text-white resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                disabled={saving || !title.trim()}
                className="w-full"
              >
                {saving ? 'Scheduling...' : 'Schedule Activity'}
              </Button>
            </form>

            {/* Activities List */}
            <div className="space-y-3">
              <h4 className="font-medium text-zinc-400">Scheduled Activities</h4>
              {renderActivities()}
            </div>
          </div>
        </ExpandableSection>
        
        <ExpandableSection title="Lead Information" icon={LineChart}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contact.lead_status && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <LineChart className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Lead Status</div>
                  <div className="text-white capitalize">{contact.lead_status.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            {contact.lead_source && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Lead Source</div>
                  <div className="text-white capitalize">{contact.lead_source.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            {contact.conversion_status && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <ArrowRight className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Conversion Status</div>
                  <div className="text-white capitalize">{contact.conversion_status.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            {contact.lead_score !== null && contact.lead_score !== undefined && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <LineChart className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Lead Score</div>
                  <div className="text-white">{contact.lead_score}/100</div>
                </div>
              </div>
            )}
            {contact.expected_value && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <LineChart className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Expected Value</div>
                  <div className="text-white">£{contact.expected_value}</div>
                </div>
              </div>
            )}
            {contact.probability !== null && contact.probability !== undefined && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <LineChart className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Probability</div>
                  <div className="text-white">{contact.probability}%</div>
                </div>
              </div>
            )}
            {contact.next_follow_up && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Next Follow-up</div>
                  <div className="text-white">{new Date(contact.next_follow_up).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Pipeline Stage */}
          {contact.probability !== null && contact.probability !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-zinc-400">Pipeline Progress</div>
                <span className="text-sm text-white/60">
                  {contact.probability}% Complete
                </span>
              </div>
              <div className="h-2 bg-black border border-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${contact.probability || 0}%` }}
                />
              </div>
            </div>
          )}
        </ExpandableSection>
        
        <ExpandableSection title="Team & Assignment" icon={Users}>
          <div className="space-y-4 pb-6">
            {/* Current Assignment Display */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-zinc-400">Assigned To</div>
                <div className="text-white">
                  {contact.assigned_to 
                    ? users?.find(u => u.id === contact.assigned_to)?.name || 'Unknown'
                    : 'Unassigned'
                  }
                </div>
              </div>
            </div>

            {/* Department Display */}
            {contact.department && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Department</div>
                  <div className="text-white">{contact.department}</div>
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>
      </div>
    </div>
  )
} 