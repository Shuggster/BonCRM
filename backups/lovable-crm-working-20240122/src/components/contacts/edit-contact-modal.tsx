"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Tags } from "lucide-react"
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
import { Session } from '@supabase/supabase-js'
import { cn } from "@/lib/utils"
import { ContactTags } from "@/components/contacts/contact-tags"

interface EditContactModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onContactUpdated: () => void
  session: Session | null
}

export function EditContactModal({
  contact,
  isOpen,
  onClose,
  onContactUpdated,
  session
}: EditContactModalProps) {
  const [formData, setFormData] = useState<Contact | null>(null)
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
      setFormData({
        ...contact,
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
        assigned_to: contact.assigned_to || null,
        assigned_to_type: contact.assigned_to_type || null,
        department: contact.department || null,
        updated_at: new Date().toISOString()
      })
    }
  }, [contact, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsLoading(true)

    try {
      await contactsService.updateContact({
        ...formData,
        updated_at: new Date().toISOString()
      })
      onContactUpdated()
      onClose()
      toast.success('Contact updated successfully')
    } catch (error: any) {
      console.error('Error updating contact:', error.message || error)
      toast.error('Failed to update contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    if (!formData) return
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null)
  }

  const handleAssignment = (selection: { type: 'user' | 'team', id: string, department?: string }) => {
    if (!formData) return
    setFormData(prev => prev ? ({
      ...prev,
      assigned_to: selection.id,
      assigned_to_type: selection.type,
      department: selection.department || null
    }) : null)
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