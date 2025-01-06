"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Tags, Target, Factory, Users, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
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
import { IndustryManagementModal } from '@/components/contacts/industry-management-modal'
import type { Contact, LeadStatus, LeadSource, ConversionStatus, Industry } from '@/types/index'

interface EditContactModalProps {
  contact?: Contact
  isOpen: boolean
  onClose: () => void
  onContactUpdated: () => void
  session: any
}

interface FormData extends Omit<Contact, 'lead_score' | 'expected_value' | 'probability' | 'lead_status' | 'lead_source' | 'conversion_status'> {
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
  const [formData, setFormData] = useState<Partial<Contact> | null>(null)
  const [saving, setSaving] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [showIndustryManagement, setShowIndustryManagement] = useState(false)

  // Fetch industries on mount
  useEffect(() => {
    const fetchIndustries = async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name')

      if (!error && data) {
        setIndustries(data)
      }
    }

    fetchIndustries()
  }, [])

  useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({})
    }
  }, [contact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    setSaving(true)

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
        first_name: formData.first_name || '',
        last_name: formData.last_name || undefined,
        email: formData.email || '',
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        job_title: formData.job_title || undefined,
        address_line1: formData.address_line1 || undefined,
        address_line2: formData.address_line2 || undefined,
        city: formData.city || undefined,
        region: formData.region || undefined,
        postcode: formData.postcode || undefined,
        country: formData.country || undefined,
        website: formData.website || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        avatar_url: formData.avatar_url || undefined,
        industry_id: formData.industry_id || undefined,
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
        updateData.lead_score = parseInt(formData.lead_score.toString())
      }
      if (formData.expected_value) {
        updateData.expected_value = parseInt(formData.expected_value.toString())
      }
      if (formData.probability) {
        updateData.probability = parseInt(formData.probability.toString())
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
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Contact, value: any) => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }

  const handleAssignment = (selection: TeamSelectValue | null) => {
    if (!formData) return
    
    setFormData({
      ...formData,
      assigned_to: selection?.id || null,
      assigned_to_type: selection?.type || null,
      department: formData.department || null
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
          <DialogTitle className="text-xl font-semibold text-white">
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
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">First Name</Label>
                        <Input
                          value={formData?.first_name || ''}
                          onChange={(e) => handleChange('first_name', e.target.value)}
                          className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Last Name</Label>
                        <Input
                          value={formData?.last_name || ''}
                          onChange={(e) => handleChange('last_name', e.target.value)}
                          className="bg-black border-white/10 focus:border-white/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-white/70 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={formData?.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="bg-black border-white/10 focus:border-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-white/70 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        value={formData?.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="bg-black border-white/10 focus:border-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          Company
                        </Label>
                        <Input
                          value={formData?.company || ''}
                          onChange={(e) => handleChange('company', e.target.value)}
                          className="bg-black border-white/10 focus:border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Factory className="w-4 h-4 text-purple-500" />
                            Industry
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-500"
                            onClick={() => setShowIndustryManagement(true)}
                          >
                            Manage
                          </Button>
                        </Label>
                        <Select
                          value={formData?.industry_id?.toString() || ''}
                          onValueChange={(value) => handleChange('industry_id', value)}
                        >
                          <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                            <SelectValue placeholder="Select industry" className="text-white/40" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border border-white/10">
                            <SelectItem value="">None</SelectItem>
                            {industries.map((industry) => (
                              <SelectItem key={industry.id} value={industry.id}>
                                {industry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                        value={formData?.company || ''}
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
                        value={formData?.job_title || ''}
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
                        value={formData?.website || ''}
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
                      defaultValue={formData?.assigned_to ? {
                        type: formData.assigned_to_type as 'user' | 'team',
                        id: formData.assigned_to
                      } : undefined}
                      includeTeams={true}
                      currentDepartment={formData?.department || undefined}
                      allowCrossDepartment={formData?.assigned_to_type === 'admin'}
                    />
                    {formData?.assigned_to_type !== 'admin' && formData?.department && (
                      <p className="text-xs text-gray-400 mt-1">
                        You can only assign to members of the {formData.department} department
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
                          value={formData?.lead_status || undefined}
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
                          value={formData?.lead_source || undefined}
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
                        <Label>Conversion Status</Label>
                        <Select
                          value={formData?.conversion_status || undefined}
                          onValueChange={(value: ConversionStatus) => handleChange('conversion_status', value)}
                        >
                          <SelectTrigger className="bg-[#1C2333] border-white/10 focus:border-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="opportunity">Opportunity</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Lead Score (0-100)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData?.lead_score || ''}
                          onChange={(e) => handleChange('lead_score', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expected Value (£)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData?.expected_value || ''}
                          onChange={(e) => handleChange('expected_value', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Probability (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData?.probability || ''}
                          onChange={(e) => handleChange('probability', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Next Follow-up</Label>
                        <Input
                          type="date"
                          value={formData?.next_follow_up || ''}
                          onChange={(e) => handleChange('next_follow_up', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Last Contact Date</Label>
                        <Input
                          type="date"
                          value={formData?.last_contact_date || ''}
                          onChange={(e) => handleChange('last_contact_date', e.target.value)}
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
                      contactId={formData?.id || ''} 
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
                        value={formData?.address_line1 || ''}
                        onChange={(e) => handleChange('address_line1', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 2</Label>
                      <Input
                        value={formData?.address_line2 || ''}
                        onChange={(e) => handleChange('address_line2', e.target.value)}
                        className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData?.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input
                          value={formData?.region || ''}
                          onChange={(e) => handleChange('region', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={formData?.postcode || ''}
                          onChange={(e) => handleChange('postcode', e.target.value)}
                          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={formData?.country || ''}
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
                      value={formData?.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="h-24 md:h-32 bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
                      placeholder="Add any notes about this contact..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 border-t border-white/10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-white/70 hover:text-white/90"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        <IndustryManagementModal 
          isOpen={showIndustryManagement}
          onClose={() => setShowIndustryManagement(false)}
          onIndustriesUpdated={() => {
            const fetchIndustries = async () => {
              const { data, error } = await supabase
                .from('industries')
                .select('*')
                .order('name')

              if (!error && data) {
                setIndustries(data)
              }
            }
            fetchIndustries()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}