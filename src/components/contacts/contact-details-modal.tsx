"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, Mail, Phone, ExternalLink, Edit, X, Calendar, Clock, CheckCircle2, XCircle, Users, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ContactNotes } from "./contact-notes"
import type { Contact } from "@/lib/supabase/services/contacts"
import { ContactTag } from "./contact-tag"
import { activityCalendarService } from '@/lib/supabase/services/activity-calendar'
import type { UserSession } from "@/types/users"
import { useSession } from "next-auth/react"

interface ScheduledActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'follow_up'
  title: string
  description: string | null
  scheduled_for: string
  status: 'pending' | 'completed' | 'cancelled'
  completed_at: string | null
}

interface ContactDetailsModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export function ContactDetailsModal({
  contact,
  isOpen,
  onClose,
  onEdit,
}: ContactDetailsModalProps) {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<ScheduledActivity[]>([])
  const [assignedUserDetails, setAssignedUserDetails] = useState<{ name: string, email: string } | null>(null)

  useEffect(() => {
    if (contact && isOpen) {
      fetchActivities()
    }
  }, [contact, isOpen])

  useEffect(() => {
    async function fetchAssignedUser() {
      if (contact?.assigned_to && contact?.assigned_to_type === 'user') {
        const { data, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', contact.assigned_to)
          .single()

        if (!error && data) {
          setAssignedUserDetails(data)
        }
      } else {
        setAssignedUserDetails(null)
      }
    }

    fetchAssignedUser()
  }, [contact?.assigned_to, contact?.assigned_to_type])

  const fetchActivities = async () => {
    if (!contact) return

    const { data, error } = await supabase
      .from('scheduled_activities')
      .select('*')
      .eq('contact_id', contact.id)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching activities:', error)
      return
    }

    setActivities(data || [])
  }

  if (!contact) return null

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5 text-green-400" />
      case 'email':
        return <Mail className="w-5 h-5 text-blue-400" />
      case 'meeting':
        return <Users className="w-5 h-5 text-purple-400" />
      default:
        return <ArrowRight className="w-5 h-5 text-orange-400" />
    }
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const formatAddress = () => {
    const parts = [
      contact.address_line1,
      contact.address_line2,
      contact.city,
      contact.region,
      contact.postcode,
      contact.country
    ].filter(Boolean)
    return parts.length > 0 ? (
      <div className="flex flex-col">
        {contact.address_line1 && <span>{contact.address_line1}</span>}
        {contact.address_line2 && <span>{contact.address_line2}</span>}
        {contact.city && <span>{contact.city}</span>}
        {contact.region && <span>{contact.region}</span>}
        {contact.postcode && <span>{contact.postcode}</span>}
        {contact.country && <span>{contact.country}</span>}
      </div>
    ) : null
  }

  const handleComplete = async (activityId: string) => {
    try {
      if (!session?.user) {
        console.error('No session found')
        return
      }

      // Convert NextAuth session to UserSession
      const userSession: UserSession = {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          department: session.user.department
        }
      }

      await activityCalendarService.updateActivityStatus(userSession, activityId, 'completed')
      fetchActivities()
      // Trigger calendar refresh
      window.dispatchEvent(new Event('calendar:refresh'))
    } catch (error) {
      console.error('Error completing activity:', error)
    }
  }

  const handleCancel = async (activityId: string) => {
    try {
      if (!session?.user) {
        console.error('No session found')
        return
      }

      // Convert NextAuth session to UserSession
      const userSession: UserSession = {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          department: session.user.department
        }
      }

      await activityCalendarService.updateActivityStatus(userSession, activityId, 'cancelled')
      fetchActivities()
      // Trigger calendar refresh
      window.dispatchEvent(new Event('calendar:refresh'))
    } catch (error) {
      console.error('Error cancelling activity:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-2xl bg-gradient-to-br from-background via-background to-background/80 rounded-lg shadow-xl border border-border/50 backdrop-blur-sm"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                    Contact Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onEdit}
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors duration-200"
                      title="Edit Contact"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors duration-200"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <Section title="Basic Information">
                      <InfoItem icon={User} label="Name" value={contact.name} />
                      <InfoItem icon={Mail} label="Email" value={contact.email} isEmail />
                      {contact.phone && (
                        <InfoItem icon={Phone} label="Phone" value={contact.phone} isPhone />
                      )}
                    </Section>

                    {/* Work Info */}
                    {(contact.company || contact.job_title) && (
                      <Section title="Work">
                        {contact.company && (
                          <InfoItem icon={Building2} label="Company" value={contact.company} />
                        )}
                        {contact.job_title && (
                          <InfoItem icon={Briefcase} label="Job Title" value={contact.job_title} />
                        )}
                      </Section>
                    )}

                    {/* Assignment Info */}
                    {(contact.assigned_to || contact.department) && (
                      <Section title="Assignment">
                        {contact.assigned_to && (
                          <InfoItem 
                            icon={User} 
                            label="Assigned To" 
                            value={
                              <div className="flex flex-col">
                                <span>
                                  {contact.assigned_to_type === 'user' && contact.assigned_user
                                    ? contact.assigned_user.name
                                    : contact.assigned_to_type === 'team' && contact.assigned_team
                                    ? contact.assigned_team.name
                                    : 'Unassigned'}
                                </span>
                                {contact.assigned_to_type === 'user' && contact.assigned_user?.department && (
                                  <span className="text-sm text-muted-foreground">
                                    {contact.assigned_user.department}
                                  </span>
                                )}
                              </div>
                            }
                          />
                        )}
                        {contact.department && (
                          <InfoItem 
                            icon={Users} 
                            label="Department" 
                            value={contact.department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                          />
                        )}
                      </Section>
                    )}

                    {/* Notes Section */}
                    <Section title="Notes">
                      <ContactNotes contactId={contact.id} />
                    </Section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Address */}
                    {formatAddress() && (
                      <Section title="Address">
                        <InfoItem icon={MapPin} label="Address" value={formatAddress()} />
                      </Section>
                    )}

                    {/* Online Presence */}
                    {(contact.website || contact.linkedin || contact.twitter) && (
                      <Section title="Online Presence">
                        {contact.website && (
                          <InfoItem
                            icon={Globe}
                            label="Website"
                            value={contact.website}
                            href={contact.website}
                          />
                        )}
                        {contact.linkedin && (
                          <InfoItem 
                            icon={Linkedin} 
                            label="LinkedIn" 
                            value="View Profile" 
                            href={contact.linkedin}
                          />
                        )}
                        {contact.twitter && (
                          <InfoItem 
                            icon={Twitter} 
                            label="Twitter" 
                            value="View Profile" 
                            href={contact.twitter}
                          />
                        )}
                      </Section>
                    )}
                  </div>
                </div>

                {/* Tags - Full Width */}
                {contact.tags && contact.tags.length > 0 && (
                  <Section title="Tags" className="col-span-full">
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tagId) => (
                        <ContactTag key={tagId} tagId={tagId} />
                      ))}
                    </div>
                  </Section>
                )}

                {/* Scheduled Activities */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Scheduled Activities
                  </h3>
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <p className="text-gray-400 text-sm">No activities scheduled</p>
                    ) : (
                      activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getActivityIcon(activity.type)}
                              <div>
                                <h4 className="text-white font-medium">{activity.title}</h4>
                                {activity.description && (
                                  <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  {formatDateTime(activity.scheduled_for)}
                                  <span className={`ml-2 ${getStatusColor(activity.status)}`}>
                                    • {activity.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleComplete(activity.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-700 text-green-400"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleCancel(activity.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-700 text-red-400"
                                title="Cancel activity"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </> 
      )}
    </AnimatePresence>
  )
}

const Section = ({ title, children, className = "" }: { 
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={`space-y-3 ${className}`}>
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
)

const InfoItem = ({ icon: Icon, label, value, href, isEmail, isPhone }: {
  icon: any
  label: string
  value: string | null | JSX.Element
  href?: string
  isEmail?: boolean
  isPhone?: boolean
}) => {
  if (!value) return null

  // Color mapping for icons
  const getIconColor = (icon: any) => {
    switch (icon) {
      case User:
        return "text-blue-400"
      case Mail:
        return "text-purple-400"
      case Phone:
        return "text-green-400"
      case Building2:
        return "text-amber-400"
      case Briefcase:
        return "text-orange-400"
      case MapPin:
        return "text-red-400"
      case Globe:
        return "text-cyan-400"
      case Linkedin:
        return "text-blue-500"
      case Twitter:
        return "text-sky-400"
      default:
        return "text-muted-foreground"
    }
  }

  // If it's an email or phone, create the appropriate href
  const finalHref = isEmail ? `mailto:${value}` : isPhone ? `tel:${value}` : href

  const content = (
    <div className={`group flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${finalHref ? 'hover:bg-muted/80' : ''} transition-all duration-200`}>
      <Icon className={`w-5 h-5 ${getIconColor(Icon)} transition-colors duration-200`} />
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {typeof value === 'string' ? (
          <p className={`text-sm truncate ${finalHref ? 'group-hover:text-primary' : ''}`}>{value}</p>
        ) : (
          value
        )}
      </div>
      {finalHref && (
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </div>
  )

  if (finalHref) {
    return (
      <a href={finalHref} target={isEmail || isPhone ? undefined : "_blank"} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}