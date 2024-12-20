"use client"

import { useState, useEffect } from "react"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { AvatarUpload } from "./avatar-upload"
import { formatUrl } from "@/lib/utils"

interface Industry {
  id: string
  name: string
  description: string | null
}

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onContactCreated: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function InputField({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  iconColor = "text-blue-400" // Default icon color
}: {
  icon: any
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  iconColor?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor}`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export function CreateContactModal({
  isOpen,
  onClose,
  onContactCreated,
}: CreateContactModalProps) {
  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
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
    industry_id: '',
  }

  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
    }
  }, [isOpen])

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
    try {
      e.preventDefault()
      setLoading(true)
      console.log('Submitting contact data:', formData)

      // Split name into first_name and last_name
      const nameParts = formData.name.trim().split(/\s+/)
      const submissionData = {
        first_name: nameParts[0],
        last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        job_title: formData.jobTitle, // Note: changed from jobTitle to job_title to match DB
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        region: formData.region,
        postcode: formData.postcode,
        country: formData.country,
        website: formData.website.trim(),
        linkedin: formData.linkedin.trim(),
        twitter: formData.twitter.trim(),
        avatar_url: formData.avatar_url,
        industry_id: formData.industry_id || null
      }

      console.log('Submitting to Supabase:', submissionData)

      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert([submissionData])
        .select('*')

      if (insertError) {
        console.error('Insert error:', insertError.message, insertError.details)
        throw insertError
      }

      console.log('Contact created successfully:', data)
      onContactCreated()
      onClose()
      setFormData(initialFormData)
    } catch (error: any) {
      console.error('Failed to create contact:', error.message || error)
      alert('Error creating contact: ' + (error.message || 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl rounded-lg bg-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3 sm:px-6">
              <h2 className="text-lg font-semibold text-white">Create New Contact</h2>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-6">
                <div className="flex justify-center pb-6 border-b border-gray-700">
                  <AvatarUpload
                    url={formData.avatar_url}
                    name={formData.name || 'New Contact'}
                    onUpload={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  />
                </div>

                <Section title="Basic Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      icon={User}
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Contact name"
                      iconColor="text-blue-400"
                    />
                    <InputField
                      icon={User}
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="Email address"
                      iconColor="text-blue-400"
                    />
                    <InputField
                      icon={User}
                      label="Phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      iconColor="text-blue-400"
                    />
                  </div>
                </Section>

                <Section title="Work Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Company</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Industry</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <select
                          value={formData.industry_id}
                          onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

                    <InputField
                      icon={Briefcase}
                      label="Job Title"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Job title"
                      iconColor="text-purple-400"
                    />
                  </div>
                </Section>

                <Section title="Address">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <InputField
                        icon={MapPin}
                        label="Address Line 1"
                        value={formData.address_line1}
                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                        placeholder="Street address"
                        iconColor="text-green-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <InputField
                        icon={MapPin}
                        label="Address Line 2"
                        value={formData.address_line2}
                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                        placeholder="Apartment, suite, etc."
                        iconColor="text-green-400"
                      />
                    </div>
                    <InputField
                      icon={MapPin}
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      iconColor="text-green-400"
                    />
                    <InputField
                      icon={MapPin}
                      label="State/Region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="State/Region"
                      iconColor="text-green-400"
                    />
                    <InputField
                      icon={MapPin}
                      label="Postal Code"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="Postal code"
                      iconColor="text-green-400"
                    />
                    <InputField
                      icon={MapPin}
                      label="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country"
                      iconColor="text-green-400"
                    />
                  </div>
                </Section>

                <Section title="Online Presence">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      icon={Globe}
                      label="Website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="Website URL"
                      iconColor="text-orange-400"
                    />
                    <InputField
                      icon={Linkedin}
                      label="LinkedIn"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn profile"
                      iconColor="text-blue-400"
                    />
                    <InputField
                      icon={Twitter}
                      label="Twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="Twitter profile"
                      iconColor="text-sky-400"
                    />
                  </div>
                </Section>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  {loading ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}