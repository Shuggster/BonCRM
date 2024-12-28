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
}

function ExpandableSection({ title, icon: Icon, children }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

interface TeamAssignmentUser {
  id: string
  name: string
  department: string
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
  
  // Activity scheduling state
  const [title, setTitle] = useState("")
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'follow_up'>('call')
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState<Date | null>(new Date())
  const [duration, setDuration] = useState(30)
  
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
      if (!initialContact.id) return
      setLoadingActivities(true)
      try {
        const { data, error } = await activityCalendarService.getActivitiesByContactId(initialContact.id)
        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        console.error('Error fetching activities:', err)
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
  }, [])

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
        contact_id: initialContact.id,
        scheduled_for: scheduledFor,
        duration_minutes: duration
      })

      // Clear form
      setTitle('')
      setActivityType('call')
      setNotes('')
      setScheduledFor(new Date())
      setDuration(30)
      
      // Refresh activities list
      setRefreshKey(prev => prev + 1)
      
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

  // Update initialContact effect without triggering refresh
  useEffect(() => {
    setContact(initialContact)
  }, [initialContact])

  // Upper section content
  if (section === 'upper') {
    return (
      <div className="relative">
        {/* Main Contact Info - Always Visible */}
        <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="relative z-10">
            {/* Header with Avatar */}
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-zinc-400">Phone</div>
                      <div className="text-white">{initialContact.phone}</div>
                    </div>
                  </div>
                )}
                {initialContact.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-zinc-400">Email</div>
                      <div className="text-white">{initialContact.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* First set of expandable sections */}
        <div 
          className="space-y-0 divide-y divide-white/[0.08]"
          style={{ 
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Department</div>
                    <div className="text-white">{initialContact.department}</div>
                  </div>
                </div>
              )}
              {initialContact.industries && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10">
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
    <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="relative z-10">
        <div 
          className="space-y-0 divide-y divide-white/[0.08]"
        >
          <ExpandableSection title="Scheduling & Activities" icon={Calendar}>
            <div className="space-y-6 bg-black rounded-xl p-6">
              {/* Activity Scheduling Form */}
              <form onSubmit={handleScheduleActivity} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity title"
                    required
                    className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-white/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['call', 'email', 'meeting', 'follow_up'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActivityType(type as any)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border border-white/10",
                          type === activityType
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                            : 'bg-black hover:border-white/20'
                        )}
                      >
                        {getActivityIcon(type)}
                        <span className="text-xs capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Schedule For
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <DatePicker
                        selected={scheduledFor}
                        onChange={(date) => setScheduledFor(date)}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-md text-white placeholder-white/40"
                        popperClassName="react-datepicker-left"
                        calendarClassName="bg-zinc-900 border border-white/10 rounded-lg shadow-xl"
                        popperPlacement="top-start"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                        min="5"
                        max="480"
                        step="5"
                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-md text-white placeholder-white/40"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Duration in minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or details..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-md text-white placeholder-white/40"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setTitle('')
                      setActivityType('call')
                      setNotes('')
                      setScheduledFor(new Date())
                      setDuration(30)
                    }}
                    className="text-white/70 hover:text-white/90"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/90">Upcoming Activities</h3>
                  {activities.length > 0 && (
                    <span className="text-xs text-white/60">{activities.length} activities</span>
                  )}
                </div>
                {loadingActivities ? (
                  <div className="text-sm text-white/60">Loading activities...</div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-black border border-white/10"
                      >
                        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{activity.title}</div>
                          <div className="text-xs text-white/60 mt-0.5">
                            {new Date(activity.scheduled_for).toLocaleString()}
                          </div>
                          {activity.description && (
                            <div className="text-xs text-white/40 mt-1">{activity.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-${activity.type === 'call' ? 'green' : activity.type === 'email' ? 'blue' : activity.type === 'meeting' ? 'purple' : 'orange'}-500/20 text-${activity.type === 'call' ? 'green' : activity.type === 'email' ? 'blue' : activity.type === 'meeting' ? 'purple' : 'orange'}-400`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/60">
                    No upcoming activities
                  </div>
                )}
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
    </div>
  )
} 