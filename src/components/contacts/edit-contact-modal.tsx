"use client"

import { useState, useEffect } from "react"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface Industry {
  id: string
  name: string
  description: string | null
}

interface Contact {
  id: string
  first_name: string
  last_name: string | null
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
  avatar_url: string | null
  industry_id: string | null
}

interface EditContactModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onContactUpdated: () => void
}

export function EditContactModal({
  contact,
  isOpen,
  onClose,
  onContactUpdated,
}: EditContactModalProps) {
  const initialFormData: Contact = {
    id: '',
    first_name: '',
    last_name: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    address_line1: '',
    address_line2: '',
    city: '',
    region: '',
    postcode: '',
    country: '',
    website: '',
    linkedin: '',
    twitter: '',
    avatar_url: '',
    industry_id: ''
  }

  const [isLoading, setIsLoading] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [formData, setFormData] = useState<Contact>(initialFormData)

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
    }
  }, [isOpen])

  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        id: contact.id || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        address_line1: contact.address_line1 || '',
        address_line2: contact.address_line2 || '',
        city: contact.city || '',
        region: contact.region || '',
        postcode: contact.postcode || '',
        country: contact.country || '',
        website: contact.website || '',
        linkedin: contact.linkedin || '',
        twitter: contact.twitter || '',
        avatar_url: contact.avatar_url || '',
        industry_id: contact.industry_id || ''
      })
    }
  }, [contact, isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchIndustries()
    }
  }, [isOpen])

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name')

      if (error) throw error
      setIndustries(data || [])
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name?.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone?.trim() || null,
          company: formData.company?.trim() || null,
          job_title: formData.job_title?.trim() || null,
          address_line1: formData.address_line1?.trim() || null,
          address_line2: formData.address_line2?.trim() || null,
          city: formData.city?.trim() || null,
          region: formData.region?.trim() || null,
          postcode: formData.postcode?.trim() || null,
          country: formData.country?.trim() || null,
          website: formData.website?.trim() || null,
          linkedin: formData.linkedin?.trim() || null,
          twitter: formData.twitter?.trim() || null,
          industry_id: formData.industry_id || null
        })
        .eq('id', contact?.id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      onContactUpdated()
      onClose()
    } catch (error: any) {
      console.error('Error updating contact:', error.message || error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!contact) return null

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
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="p-6 border-b border-border/10">
                  <h2 className="text-lg font-medium text-muted-foreground">Edit Contact</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                  <div className="grid-layout gap-6">
                    {/* Form sections in 3 columns */}
                    <div className="space-y-4">
                      <Section title="Basic Information">
                        {/* Basic info fields */}
                      </Section>
                    </div>

                    <div className="space-y-4">
                      <Section title="Work">
                        {/* Work fields */}
                      </Section>
                    </div>

                    <div className="space-y-4">
                      <Section title="Contact Details">
                        {/* Contact fields */}
                      </Section>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/10 bg-muted/50">
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/10">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
)

const InputField = ({ 
  icon: Icon, 
  label, 
  name, 
  type = "text",
  value,
  onChange,
  required = false
}: {
  icon?: any
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) => {
  // Color mapping for icons
  const getIconColor = (icon: any) => {
    switch (icon) {
      case User:
        return "text-blue-400"
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

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className={`w-4 h-4 ${getIconColor(Icon)}`} />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${Icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  )
}

<style jsx global>{`
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`}</style>