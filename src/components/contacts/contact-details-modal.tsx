"use client"

import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, Mail, Phone, ExternalLink, Edit, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { ContactNotes } from "./contact-notes"

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  job_title: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  region: string | null
  postcode: string | null
  country: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  tags: {
    id: string
    name: string
    color: string
  }[]
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
  if (!contact) return null

  const formatAddress = () => {
    const parts = [
      contact.address_line1,
      contact.address_line2,
      contact.city,
      contact.region,
      contact.postcode,
      contact.country
    ].filter(Boolean)
    return parts.join(', ')
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
                {contact.tags.length > 0 && (
                  <Section title="Tags" className="col-span-full">
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map(tag => (
                        <span
                          key={tag.id}
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          className="px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Notes - Full Width */}
                <Section title="Notes" className="col-span-full">
                  <ContactNotes contactId={contact.id} />
                </Section>
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
  value: string | null
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
        <p className={`text-sm truncate ${finalHref ? 'group-hover:text-primary' : ''}`}>{value}</p>
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