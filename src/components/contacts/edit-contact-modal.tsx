"use client"

import { useState, useEffect } from "react"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { AvatarUpload } from "./avatar-upload"

interface Industry {
  id: string
  name: string
  description: string | null
}

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
  const [isLoading, setIsLoading] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [formData, setFormData] = useState<Contact | null>(null)

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    }
  }, [contact])

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
        .update(formData)
        .eq('id', contact?.id)

      if (error) throw error

      onContactUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating contact:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null)
  }

  if (!formData) return null

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
                <div className="px-6 py-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                      Edit Contact
                    </h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors duration-200"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <Section title="Basic Information">
                        <InputField
                          icon={User}
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <InputField
                          icon={User}
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <InputField
                          icon={User}
                          label="Phone"
                          name="phone"
                          type="tel"
                          value={formData.phone || ""}
                          onChange={handleChange}
                        />
                      </Section>

                      <Section title="Work">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">Company</label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <input
                                type="text"
                                value={formData.company || ''}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded border border-gray-600"
                                placeholder="Company name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Industry</label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <select
                                value={formData.industry_id || ''}
                                onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded border border-gray-600"
                              >
                                <option value="">Select an industry</option>
                                {industries.map((industry) => (
                                  <option key={industry.id} value={industry.id}>
                                    {industry.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <InputField
                          icon={Briefcase}
                          label="Job Title"
                          name="job_title"
                          value={formData.job_title || ""}
                          onChange={handleChange}
                        />
                      </Section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <Section title="Address">
                        <InputField
                          icon={MapPin}
                          label="Address Line 1"
                          name="address_line1"
                          value={formData.address_line1 || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          icon={MapPin}
                          label="Address Line 2"
                          name="address_line2"
                          value={formData.address_line2 || ""}
                          onChange={handleChange}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <InputField
                            label="City"
                            name="city"
                            value={formData.city || ""}
                            onChange={handleChange}
                          />
                          <InputField
                            label="Region"
                            name="region"
                            value={formData.region || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <InputField
                            label="Postal Code"
                            name="postcode"
                            value={formData.postcode || ""}
                            onChange={handleChange}
                          />
                          <InputField
                            label="Country"
                            name="country"
                            value={formData.country || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </Section>

                      <Section title="Online Presence">
                        <InputField
                          icon={Globe}
                          label="Website"
                          name="website"
                          type="url"
                          value={formData.website || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          icon={Linkedin}
                          label="LinkedIn"
                          name="linkedin"
                          type="url"
                          value={formData.linkedin || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          icon={Twitter}
                          label="Twitter"
                          name="twitter"
                          type="url"
                          value={formData.twitter || ""}
                          onChange={handleChange}
                        />
                      </Section>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/50">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors duration-200"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
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
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <div className="space-y-2">
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