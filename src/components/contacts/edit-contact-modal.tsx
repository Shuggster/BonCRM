"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Tags, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Contact, contactsService } from "@/lib/supabase/services/contacts"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { TeamSelect } from "@/components/ui/team-select"
import { supabase } from '@/lib/supabase'
import { UserSession } from "@/types/users"
import { cn } from "@/lib/utils"
import { ContactTags } from "@/components/contacts/contact-tags"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Contact as ContactType, LeadStatus, LeadSource, ConversionStatus } from '@/types'

interface EditContactModalProps {
  contact: ContactType | null
  isOpen: boolean
  onClose: () => void
  onContactUpdated: () => void
  session: UserSession | null
}

interface FormData extends Omit<ContactType, 'lead_score' | 'expected_value' | 'probability' | 'lead_status' | 'lead_source' | 'conversion_status'> {
  lead_score: string
  expected_value: string
  probability: string
  lead_status: LeadStatus | null
  lead_source: LeadSource | null
  conversion_status: ConversionStatus | null
}

interface TeamSelectValue {
  type: 'user' | 'team'
  id: string
}

interface TeamSelectProps {
  onSelect: (selection: TeamSelectValue) => void
  defaultValue?: TeamSelectValue
  includeTeams?: boolean
  currentDepartment?: string
  allowCrossDepartment?: boolean
}

export function EditContactModal({
  contact,
  isOpen,
  onClose,
  onContactUpdated,
  session
}: EditContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
    id: '',
    created_at: new Date().toISOString(),
    first_name: '',
    last_name: null,
    email: '',
    phone: null,
    company: null,
    job_title: null,
    address_line1: null,
    address_line2: null,
    city: null,
    region: null,
    postcode: null,
    country: null,
    website: null,
    linkedin: null,
    twitter: null,
    avatar_url: null,
    assigned_to: null,
    assigned_to_type: null,
    department: null,
    updated_at: new Date().toISOString(),
    tags: [],
    notes: null,
    industry_id: null,
    lead_status: null,
    lead_source: null,
    lead_score: '',
    expected_value: '',
    probability: '',
    next_follow_up: null,
    conversion_status: null,
    first_contact_date: null,
    last_contact_date: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userDepartment, setUserDepartment] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch current user's department
  useEffect(() => {
    async function fetchUserDetails() {
      if (!session?.user?.id) return
      
      const { data, error } = await supabase
        .from('users')
        .select('department, role')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setUserDepartment(data.department)
        setIsAdmin(data.role === 'admin')
      }
    }
    fetchUserDetails()
  }, [session?.user?.id])

  useEffect(() => {
    if (contact && isOpen) {
      const updatedFormData: FormData = {
        id: contact.id || '',
        created_at: contact.created_at || new Date().toISOString(),
        first_name: contact.first_name || '',
        last_name: contact.last_name || null,
        email: contact.email || '',
        phone: contact.phone || null,
        company: contact.company || null,
        job_title: contact.job_title || null,
        address_line1: contact.address_line1 || null,
        address_line2: contact.address_line2 || null,
        city: contact.city || null,
        region: contact.region || null,
        postcode: contact.postcode || null,
        country: contact.country || null,
        website: contact.website || null,
        linkedin: contact.linkedin || null,
        twitter: contact.twitter || null,
        avatar_url: contact.avatar_url || null,
        assigned_to: contact.assigned_to || null,
        assigned_to_type: contact.assigned_to_type || null,
        department: contact.department || null,
        updated_at: new Date().toISOString(),
        tags: contact.tags || [],
        notes: contact.notes || null,
        industry_id: contact.industry_id || null,
        lead_status: contact.lead_status || null,
        lead_source: contact.lead_source || null,
        lead_score: (contact.lead_score ?? '').toString(),
        expected_value: (contact.expected_value ?? '').toString(),
        probability: (contact.probability ?? '').toString(),
        next_follow_up: contact.next_follow_up || null,
        conversion_status: contact.conversion_status || null,
        first_contact_date: contact.first_contact_date || null,
        last_contact_date: contact.last_contact_date || null
      }
      setFormData(updatedFormData)
    }
  }, [contact, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get default organization
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (!org) {
        console.error('No organization found')
        toast.error('Failed to update contact: No organization found')
        return
      }

      // Basic contact update
      const updateData: Partial<Contact> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        job_title: formData.job_title,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        region: formData.region,
        postcode: formData.postcode,
        country: formData.country,
        website: formData.website,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        avatar_url: formData.avatar_url,
        industry_id: formData.industry_id,
        lead_status: formData.lead_status || undefined,
        lead_source: formData.lead_source || undefined,
        conversion_status: formData.conversion_status || undefined,
        next_follow_up: formData.next_follow_up || undefined,
        first_contact_date: formData.first_contact_date || undefined,
        last_contact_date: formData.last_contact_date || undefined,
        assigned_to: formData.assigned_to || undefined,
        assigned_to_type: formData.assigned_to_type || undefined,
        department: formData.department || undefined,
        organization_id: org.id
      }

      // Only include numeric fields if they have values
      if (formData.lead_score) {
        updateData.lead_score = parseInt(formData.lead_score)
      }
      if (formData.expected_value) {
        updateData.expected_value = parseInt(formData.expected_value)
      }
      if (formData.probability) {
        updateData.probability = parseInt(formData.probability)
      }

      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contact?.id)

      if (error) {
        console.error('Error updating contact:', error)
        toast.error('Failed to update contact')
        return
      }

      toast.success('Contact updated successfully')
      onContactUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error('Failed to update contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  const handleAssignment = (selection: TeamSelectValue | null) => {
    if (!formData) return
    
    setFormData({
      ...formData,
      assigned_to: selection?.id || null,
      assigned_to_type: selection?.type || null,
      department: userDepartment || null
    })
  }

  const handleWebsiteChange = (value: string) => {
    // Allow URLs with www., http://, or https:// prefixes
    if (value && !value.match(/^(https?:\/\/|www\.)/)) {
      value = 'www.' + value
    }
    // If it starts with www., ensure it's treated as a valid URL
    if (value && value.startsWith('www.')) {
      value = 'http://' + value
    }
    handleChange('website', value.replace(/^http:\/\/www\./, 'www.'))
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[85vw] max-h-[90vh] overflow-y-auto bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-8 py-6 border-b border-white/10 sticky top-0 bg-[#0F1629] z-10">
          <DialogTitle className="text-xl font-medium">
            {contact ? 'Edit Contact' : 'New Contact'}
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
                          value={formData.last_name || ''}
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
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        value={formData.phone || ''}
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
                        value={formData.company || ''}
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
                        value={formData.job_title || ''}
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
                        value={formData.website || ''}
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
                      defaultValue={formData.assigned_to ? {
                        type: formData.assigned_to_type as 'user' | 'team',
                        id: formData.assigned_to
                      } : undefined}
                      includeTeams={true}
                      currentDepartment={userDepartment || undefined}
                      allowCrossDepartment={isAdmin}
                    />
                    {!isAdmin && userDepartment && (
                      <p className="text-xs text-gray-400 mt-1">
                        You can only assign to members of the {userDepartment} department
                      </p>
                    )}
                  </div>
                </div>

                {/* Lead Management */}
                <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Lead Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lead Status</Label>
                        <Select
                          value={formData.lead_status || undefined}
                          onValueChange={(value: LeadStatus) => handleChange('lead_status', value)}
                        >
                          <SelectTrigger className="bg-[#1C2333] border-white/10 focus:border-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Lead Source</Label>
                        <Select
                          value={formData.lead_source || undefined}
                          onValueChange={(value: LeadSource) => handleChange('lead_source', value)}
                        >
                          <SelectTrigger className="bg-[#1C2333] border-white/10 focus:border-blue-500">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="email_campaign">Email Campaign</SelectItem>
                            <SelectItem value="cold_call">Cold Call</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lead Score (0-100)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.lead_score || ''}
                          onChange={(e) => handleChange('lead_score', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expected Value (£)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.expected_value || ''}
                          onChange={(e) => handleChange('expected_value', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Probability (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.probability || ''}
                          onChange={(e) => handleChange('probability', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Next Follow-up</Label>
                        <Input
                          type="date"
                          value={formData.next_follow_up || ''}
                          onChange={(e) => handleChange('next_follow_up', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>
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
                      contactId={formData.id} 
                      onTagsChange={(tags) => {
                        if (!formData) return
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
                        value={formData.address_line1 || ''}
                        onChange={(e) => handleChange('address_line1', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 2</Label>
                      <Input
                        value={formData.address_line2 || ''}
                        onChange={(e) => handleChange('address_line2', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input
                          value={formData.region || ''}
                          onChange={(e) => handleChange('region', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={formData.postcode || ''}
                          onChange={(e) => handleChange('postcode', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={formData.country || ''}
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
                      value={formData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="h-24 md:h-32 bg-[#1C2333] border-white/10 focus:border-blue-500"
                      placeholder="Add any notes about this contact..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-[#0F1629] px-8 py-6 border-t border-white/10 flex gap-3 sm:gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 sm:px-6 py-1.5 sm:py-2 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : (contact ? "Update Contact" : "Create Contact")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}