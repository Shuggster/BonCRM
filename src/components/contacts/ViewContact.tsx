'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Contact } from "@/types"
import { cn } from "@/lib/utils"
import { 
  Phone, Mail, Building2, Briefcase, 
  Calendar, Tags, ChevronDown,
  LineChart, FileText, Users,
  Globe, Linkedin, Twitter, MapPin,
  Video, Tag, Pencil, Facebook, MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TagManagementModal } from '@/components/contacts/tag-management-modal'
import { TagStatisticsModal } from '@/components/contacts/tag-statistics-modal'
import { AssignTagsModal } from '@/components/contacts/AssignTagsModal'
import { ContactNotes } from './ContactNotes'

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
    <div className="border-b border-white/[0.08]">
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
          >
            <div className="px-6 py-4 bg-black/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ViewContact({ contact, section = 'upper', onEdit, onRefresh }: ViewContactProps) {
  const [showTagManagement, setShowTagManagement] = useState(false)
  const [showTagStats, setShowTagStats] = useState(false)
  const [showAssignTags, setShowAssignTags] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Remove the test data merge since we're using real data now
  const initials = `${contact.first_name?.[0] || ""}${contact.last_name?.[0] || ""}`.toUpperCase()
  
  // Get a color based on the first letter (simplified version)
  const colors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-red-500 to-red-600",
  ]
  const colorIndex = (contact.first_name?.charCodeAt(0) || 0) % colors.length

  // Test data for social media
  const socialData = {
    website: contact.website || 'https://example.com',
    linkedin: contact.linkedin || 'https://linkedin.com/in/example',
    twitter: contact.twitter || 'example',
    facebook: contact.facebook || 'https://facebook.com/example',
    whatsapp: contact.whatsapp || '1234567890'
  }

  // Upper section content
  if (section === 'upper') {
    return (
      <div className="h-full flex flex-col bg-zinc-900">
        {/* Header with Avatar */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            {/* Contact Info */}
            <div className="flex items-start gap-4">
              {/* Avatar/Initials */}
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white",
                colors[colorIndex]
              )}>
                {initials}
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">
                  {contact.first_name} {contact.last_name}
                </h2>
                {contact.job_title && (
                  <p className="text-sm text-white/60">{contact.job_title}</p>
                )}
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {contact.contact_tag_relations?.map((relation) => (
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
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <Phone className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <Video className="w-5 h-5 text-purple-500 group-hover:text-purple-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
              </button>
              <div className="w-px h-6 my-auto bg-white/10" />
              <button 
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <Pencil className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Permanent Information */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="grid grid-cols-2 gap-4">
            {contact.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                <Phone className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Phone</div>
                  <div className="text-white">{contact.phone}</div>
                </div>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Email</div>
                  <div className="text-white">{contact.email}</div>
                </div>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Company</div>
                  <div className="text-white">{contact.company}</div>
                </div>
              </div>
            )}
            {contact.department && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Department</div>
                  <div className="text-white">{contact.department}</div>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mt-6">
            <ContactNotes contactId={contact.id} />
          </div>

          {/* Social Media & Web Links */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white/90">Social & Web</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {socialData.website && (
                <a 
                  href={socialData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <Globe className="w-5 h-5 text-[#2196F3]" />
                  <span className="text-sm text-white/90">{new URL(socialData.website).hostname}</span>
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
            <div className="grid grid-cols-2 gap-2 mt-2 justify-items-center">
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
        </div>
      </div>
    )
  }

  // Lower section content
  return (
    <>
      <div className="h-full flex flex-col bg-zinc-900">
        <div className="flex-1 overflow-auto">
          <ExpandableSection title="Address Information" icon={MapPin}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {contact.address_line1 && (
                  <div>
                    <div className="text-sm text-zinc-400">Address Line 1</div>
                    <div className="text-white">{contact.address_line1}</div>
                  </div>
                )}
                {contact.address_line2 && (
                  <div>
                    <div className="text-sm text-zinc-400">Address Line 2</div>
                    <div className="text-white">{contact.address_line2}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {contact.city && (
                    <div>
                      <div className="text-sm text-zinc-400">City</div>
                      <div className="text-white">{contact.city}</div>
                    </div>
                  )}
                  {contact.region && (
                    <div>
                      <div className="text-sm text-zinc-400">Region/State</div>
                      <div className="text-white">{contact.region}</div>
                    </div>
                  )}
                  {contact.postcode && (
                    <div>
                      <div className="text-sm text-zinc-400">Postal Code</div>
                      <div className="text-white">{contact.postcode}</div>
                    </div>
                  )}
                  {contact.country && (
                    <div>
                      <div className="text-sm text-zinc-400">Country</div>
                      <div className="text-white">{contact.country}</div>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(
                    [
                      contact.address_line1,
                      contact.address_line2,
                      contact.city,
                      contact.region,
                      contact.postcode,
                      contact.country
                    ].filter(Boolean).join(', ')
                  )}`, '_blank')}
                >
                  View on Map
                </Button>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Scheduling & Activities" icon={Calendar}>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button variant="outline" size="sm">Schedule Call</Button>
                <Button variant="outline" size="sm">Schedule Meeting</Button>
                <Button variant="outline" size="sm">Send Email</Button>
              </div>
              <div className="text-sm text-zinc-400">
                No upcoming activities
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Tags & Categories" icon={Tags}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {contact.contact_tag_relations?.map((relation) => (
                  <div 
                    key={relation.contact_tags.id} 
                    className="px-2 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: `${relation.contact_tags.color}15`,
                      color: relation.contact_tags.color 
                    }}
                  >
                    {relation.contact_tags.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAssignTags(true)}
                >
                  Assign Tags
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowTagManagement(true)}
                >
                  Manage Tags
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowTagStats(true)}
                >
                  Tag Statistics
                </Button>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Sales Pipeline" icon={LineChart}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zinc-400">Lead Status</div>
                  <div className="text-white">{contact.lead_status || "Not set"}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Lead Score</div>
                  <div className="text-white">{contact.lead_score || "0"}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Expected Value</div>
                  <div className="text-white">${contact.expected_value || "0"}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Probability</div>
                  <div className="text-white">{contact.probability || "0"}%</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Update Pipeline</Button>
            </div>
          </ExpandableSection>

          <ExpandableSection title="Team & Assignment" icon={Users}>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-400">Assigned To</div>
                <div className="text-white">Not assigned</div>
              </div>
              <Button variant="outline" size="sm">Assign Contact</Button>
            </div>
          </ExpandableSection>
        </div>
      </div>

      <TagManagementModal 
        isOpen={showTagManagement} 
        onClose={() => setShowTagManagement(false)}
        onTagsUpdated={() => {
          // TODO: Refresh contact data to get updated tags
        }}
      />

      <TagStatisticsModal 
        isOpen={showTagStats} 
        onClose={() => setShowTagStats(false)}
      />

      <AssignTagsModal 
        isOpen={showAssignTags}
        onClose={() => setShowAssignTags(false)}
        contact={contact}
        onTagsUpdated={() => {
          setShowAssignTags(false)
          if (onRefresh) {
            onRefresh()
          }
        }}
      />
    </>
  )
} 