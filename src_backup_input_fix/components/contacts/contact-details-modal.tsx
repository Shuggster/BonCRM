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
import { Contact, LeadStatus, LeadSource, ConversionStatus } from "@/types"
import { toast } from "sonner"

interface ContactDetailsModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

interface ContactWithName {
  id: string
  name: string
  first_name: string
  last_name: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  job_title?: string | null
  lead_status: LeadStatus | null
  lead_source: LeadSource | null
  conversion_status: ConversionStatus | null
  lead_score?: number | null
  expected_value?: number | null
  probability?: number | null
  first_contact_date?: string | null
  last_contact_date?: string | null
  next_follow_up?: string | null
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
        name: `${initialContact.first_name} ${initialContact.last_name || ''}`.trim(),
        lead_status: initialContact.lead_status || null,
        lead_source: initialContact.lead_source || null,
        conversion_status: initialContact.conversion_status || null,
        lead_score: initialContact.lead_score || null,
        expected_value: initialContact.expected_value || null,
        probability: initialContact.probability || null
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
                  {/* Status Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {contact.lead_status && (
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
                          Lead Status: {contact.lead_status.charAt(0).toUpperCase() + contact.lead_status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conversion Status Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Conversion</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {contact.conversion_status && (
                        <div className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          contact.conversion_status === 'lead' && "bg-purple-500/20 text-purple-400",
                          contact.conversion_status === 'opportunity' && "bg-orange-500/20 text-orange-400",
                          contact.conversion_status === 'customer' && "bg-emerald-500/20 text-emerald-400",
                          contact.conversion_status === 'lost' && "bg-red-500/20 text-red-400"
                        )}>
                          {contact.conversion_status.charAt(0).toUpperCase() + contact.conversion_status.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Section */}
                  <div className="flex items-center gap-2">
                    {contact.lead_score !== null && contact.lead_score !== undefined && (
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        contact.lead_score >= 80 && "bg-green-500/20 text-green-400",
                        contact.lead_score >= 50 && contact.lead_score < 80 && "bg-yellow-500/20 text-yellow-400",
                        contact.lead_score < 50 && "bg-red-500/20 text-red-400"
                      )}>
                        Score: {contact.lead_score}
                      </div>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium mb-1">Lead Score Factors:</p>
                          <pre className="text-xs whitespace-pre-wrap">
                            {getScoreTooltipContent(contact.lead_score || 0)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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

function InfoItem({ icon: Icon, label, value, isEmail, isPhone }: {
  icon: any
  label: string
  value: string | null | undefined
  isEmail?: boolean
  isPhone?: boolean
}) {
  if (!value) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      {isEmail ? (
        <a href={`mailto:${value}`} className="text-blue-400 hover:text-blue-300">
          {value}
        </a>
      ) : isPhone ? (
        <a href={`tel:${value}`} className="text-blue-400 hover:text-blue-300">
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  )
}