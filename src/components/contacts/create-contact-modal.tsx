"use client"

import { useState } from "react"
import { User, Building2, Briefcase, MapPin, Globe, Mail, Phone, X, Tags } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TeamSelect } from "@/components/ui/team-select"
import { ContactTags } from "@/components/contacts/contact-tags"
import { toast } from "sonner"

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  job_title: string
  website: string
  address_line1: string
  address_line2: string
  city: string
  region: string
  postcode: string
  country: string
  notes: string
  assigned_to: string
  assigned_to_type: string
  department: string
  tags: string[]
}

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onContactCreated: () => void
}

export function CreateContactModal({
  isOpen,
  onClose,
  onContactCreated
}: CreateContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    website: "",
    address_line1: "",
    address_line2: "",
    city: "",
    region: "",
    postcode: "",
    country: "",
    notes: "",
    assigned_to: "",
    assigned_to_type: "",
    department: "",
    tags: []
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWebsiteChange = (value: string) => {
    let formattedValue = value
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      formattedValue = `https://${value}`
    }
    handleChange('website', formattedValue)
  }

  const handleAssignment = (assignment: { type: 'user' | 'team'; id: string } | undefined) => {
    if (assignment) {
      handleChange('assigned_to', assignment.id)
      handleChange('assigned_to_type', assignment.type)
    } else {
      handleChange('assigned_to', '')
      handleChange('assigned_to_type', '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          job_title: formData.job_title,
          website: formData.website,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          region: formData.region,
          postcode: formData.postcode,
          country: formData.country
        }])
        .select()

      if (error) throw error

      if (formData.notes && contact?.[0]?.id) {
        const { error: notesError } = await supabase
          .from('contact_notes')
          .insert([{
            contact_id: contact[0].id,
            content: formData.notes
          }])
        if (notesError) console.error('Error creating note:', notesError)
      }

      onContactCreated()
      onClose()
    } catch (error) {
      console.error('Error creating contact:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[85vw] max-h-[90vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-8 py-6 border-b border-white/10 sticky top-0 bg-[#0F1629] z-10">
          <DialogTitle className="text-xl font-medium">
            Create New Contact
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-7 space-y-8">
                {/* Basic Information */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={formData.first_name}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={formData.last_name}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    Work
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        Company
                      </Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-orange-500" />
                        Job Title
                      </Label>
                      <Input
                        value={formData.job_title}
                        onChange={(e) => handleChange('job_title', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-500" />
                        Website
                      </Label>
                      <Input
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleWebsiteChange(e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        placeholder="www.example.com"
                        pattern="https?:\/\/.*|www\..*"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6">Assignment</h3>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <TeamSelect
                      onSelect={handleAssignment}
                      includeTeams={true}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <Tags className="w-5 h-5 text-indigo-500" />
                    Tags
                  </h3>
                  <div className="space-y-4">
                    <ContactTags 
                      onTagsChange={(tags) => {
                        setFormData({ ...formData, tags })
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="lg:col-span-5 space-y-8">
                {/* Address */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Address Line 1</Label>
                      <Input
                        value={formData.address_line1}
                        onChange={(e) => handleChange('address_line1', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 2</Label>
                      <Input
                        value={formData.address_line2}
                        onChange={(e) => handleChange('address_line2', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State/Region</Label>
                        <Input
                          value={formData.region}
                          onChange={(e) => handleChange('region', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={formData.postcode}
                          onChange={(e) => handleChange('postcode', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => handleChange('country', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6">Notes</h3>
                  <div className="space-y-2">
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="h-24 md:h-32 bg-[#1C2333] border-white/10 focus:border-blue-500"
                      placeholder="Add any notes about this contact..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-white/10 sticky bottom-0 bg-[#0F1629] z-10 flex justify-end gap-2">
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
      </DialogContent>
    </Dialog>
  )
}