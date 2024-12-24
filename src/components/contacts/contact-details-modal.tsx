"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, Mail, Phone, ExternalLink, Edit, X, Calendar, Clock, CheckCircle2, XCircle, Users, ArrowRight, ArrowUpRight, PoundSterling, Percent, CalendarClock, HelpCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { ContactNotes } from "./contact-notes"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Contact } from "@/lib/supabase/services/contacts"
import { toast } from "sonner"

interface ContactDetailsModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

interface ContactWithName extends Contact {
  name: string
}

interface AssignedUser {
  id: string
  name: string
  department?: string
}

interface AssignedTeam {
  id: string
  name: string
  department?: string
}

interface ScheduledActivity {
  id: string
  type: string
  title: string
  description: string | null
  scheduled_for: string
  duration_minutes: number
  status: string
  created_at: string
  updated_at: string
  contact_id: string
  user_id: string
}

const getScoreTooltipContent = (score: number) => {
  const factors = []
  if (score >= 80) {
    factors.push("✓ High engagement level")
    factors.push("✓ Clear budget indication")
    factors.push("✓ Decision maker")
    factors.push("✓ Immediate need")
  } else if (score >= 50) {
    factors.push("✓ Regular engagement")
    factors.push("✓ Budget discussion started")
    factors.push("✓ Influencer level")
    factors.push("⚠ Timeline undefined")
  } else {
    factors.push("⚠ Low engagement")
    factors.push("⚠ No budget discussion")
    factors.push("⚠ Role unclear")
    factors.push("⚠ No timeline")
  }
  return factors.join("\n")
}

export function ContactDetailsModal({
  contact: initialContact,
  isOpen,
  onClose,
  onEdit,
}: ContactDetailsModalProps) {
  const [contact, setContact] = useState<ContactWithName | null>(null)
  const [activities, setActivities] = useState<ScheduledActivity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialContact) {
      setContact({
        ...initialContact,
        name: `${initialContact.first_name} ${initialContact.last_name || ''}`.trim()
      })
    }
  }, [initialContact])

  useEffect(() => {
    if (contact?.id) {
      fetchActivities()
    }
  }, [contact?.id])

  const fetchActivities = async () => {
    if (!contact?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scheduled_activities')
        .select(`
          id,
          type,
          title,
          description,
          scheduled_for,
          duration_minutes,
          status,
          created_at,
          updated_at,
          contact_id,
          user_id
        `)
        .eq('contact_id', contact.id)
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('Error fetching activities:', error)
        toast.error('Failed to load activities')
        return
      }

      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  if (!contact) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)] px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
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

              {/* Lead Management */}
              <Section title="Lead Management">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        contact.lead_status === 'new' && "bg-blue-500/20 text-blue-400",
                        contact.lead_status === 'contacted' && "bg-yellow-500/20 text-yellow-400",
                        contact.lead_status === 'qualified' && "bg-green-500/20 text-green-400",
                        contact.lead_status === 'proposal' && "bg-purple-500/20 text-purple-400",
                        contact.lead_status === 'negotiation' && "bg-orange-500/20 text-orange-400",
                        contact.lead_status === 'won' && "bg-emerald-500/20 text-emerald-400",
                        contact.lead_status === 'lost' && "bg-red-500/20 text-red-400"
                      )}>
                        {contact.lead_status.charAt(0).toUpperCase() + contact.lead_status.slice(1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        contact.lead_score >= 80 && "bg-green-500/20 text-green-400",
                        contact.lead_score >= 50 && contact.lead_score < 80 && "bg-yellow-500/20 text-yellow-400",
                        contact.lead_score < 50 && "bg-red-500/20 text-red-400"
                      )}>
                        Score: {contact.lead_score}
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium mb-1">Lead Score Factors:</p>
                            <pre className="text-xs whitespace-pre-wrap">
                              {getScoreTooltipContent(contact.lead_score)}
                            </pre>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {contact.lead_source && (
                    <InfoItem 
                      icon={ArrowUpRight} 
                      label="Lead Source" 
                      value={contact.lead_source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    />
                  )}

                  {contact.first_contact_date && (
                    <InfoItem 
                      icon={Calendar} 
                      label="First Contact" 
                      value={new Date(contact.first_contact_date).toLocaleDateString()} 
                    />
                  )}

                  {contact.last_contact_date && (
                    <InfoItem 
                      icon={Calendar} 
                      label="Last Contact" 
                      value={new Date(contact.last_contact_date).toLocaleDateString()} 
                    />
                  )}

                  {contact.expected_value && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Expected Value:</span>
                      <span>£{contact.expected_value.toLocaleString()}</span>
                    </div>
                  )}

                  {contact.probability !== null && (
                    <InfoItem 
                      icon={Percent} 
                      label="Probability" 
                      value={`${contact.probability}%`} 
                    />
                  )}

                  {contact.next_follow_up && (
                    <InfoItem 
                      icon={CalendarClock} 
                      label="Next Follow-up" 
                      value={new Date(contact.next_follow_up).toLocaleDateString()} 
                    />
                  )}
                </div>
              </Section>

              {/* Notes Section */}
              <Section title="Notes">
                <ContactNotes contactId={contact.id} />
              </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Activities */}
              <Section title="Activities">
                {loading ? (
                  <div className="text-center py-4">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No activities found</div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <div>
                            <h4 className="font-medium">{activity.title}</h4>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {new Date(activity.scheduled_for).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">{title}</h3>
    <div className="space-y-3">{children}</div>
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

  const finalHref = isEmail ? `mailto:${value}` : isPhone ? `tel:${value}` : href

  const content = (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
      finalHref && "hover:bg-muted/80 cursor-pointer"
    )}>
      <Icon className="w-5 h-5 text-primary" />
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {typeof value === 'string' ? (
          <p className="text-sm truncate">{value}</p>
        ) : (
          value
        )}
      </div>
      {finalHref && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
    </div>
  )

  if (finalHref) {
    return (
      <a href={finalHref} target={isEmail || isPhone ? undefined : "_blank"} rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}