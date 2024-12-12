"use client"

import { useState } from "react"
import { User, Building2, Briefcase, MapPin, Globe, Linkedin, Twitter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AvatarUpload } from "./avatar-upload"

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onContactCreated: () => void
}

export function CreateContactModal({
  isOpen,
  onClose,
  onContactCreated,
}: CreateContactModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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
  })

  const formatUrl = (url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('www.')) return `https://${url}`
    return `https://${url}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submissionData = {
        ...formData,
        website: formatUrl(formData.website),
        address: [
          formData.address_line1,
          formData.address_line2,
          formData.city,
          formData.region,
          formData.postcode,
          formData.country
        ].filter(Boolean).join('\n')
      }

      const { error } = await supabase
        .from('contacts')
        .insert([submissionData])

      if (error) throw error

      onContactCreated()
      onClose()
      setFormData({
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
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-center pb-4 border-b border-gray-700">
              <AvatarUpload
                url={formData.avatar_url}
                name={formData.name || 'New Contact'}
                onUpload={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Work Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={formData.address_line1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Region/State"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={formData.postcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Website (www.example.com or https://example.com)"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Social Media</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="LinkedIn Profile"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Twitter Profile"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 