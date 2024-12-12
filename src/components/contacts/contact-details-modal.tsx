"use client"

import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, Mail, Phone, ExternalLink, Edit } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  if (!isOpen || !contact) return null

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

  const InfoItem = ({ icon: Icon, label, value, href }: { 
    icon: any
    label: string
    value: string | null
    href?: string 
  }) => {
    if (!value) return null
    
    const content = (
      <>
        <Icon className="h-4 w-4 text-gray-400" />
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-sm text-gray-300">{value}</div>
        </div>
      </>
    )

    return (
      <div className="flex items-start gap-2">
        {href ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start gap-2 hover:text-blue-400"
          >
            {content}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          content
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Contact Details</h2>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">Basic Information</h3>
            <div className="space-y-2">
              <InfoItem icon={User} label="Name" value={contact.name} />
              <InfoItem 
                icon={Mail} 
                label="Email" 
                value={contact.email} 
                href={`mailto:${contact.email}`}
              />
              <InfoItem 
                icon={Phone} 
                label="Phone" 
                value={contact.phone} 
                href={contact.phone ? `tel:${contact.phone}` : undefined}
              />
            </div>
          </div>

          {/* Work Information */}
          {(contact.company || contact.job_title) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Work Information</h3>
              <div className="space-y-2">
                <InfoItem icon={Building2} label="Company" value={contact.company} />
                <InfoItem icon={Briefcase} label="Job Title" value={contact.job_title} />
              </div>
            </div>
          )}

          {/* Contact Information */}
          {formatAddress() && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
              <div className="space-y-2">
                <InfoItem icon={MapPin} label="Address" value={formatAddress()} />
                {contact.website && (
                  <InfoItem 
                    icon={Globe} 
                    label="Website" 
                    value={contact.website} 
                    href={contact.website}
                  />
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(contact.linkedin || contact.twitter) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Social Media</h3>
              <div className="space-y-2">
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
              </div>
            </div>
          )}

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map(tag => (
                  <span
                    key={tag.id}
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 