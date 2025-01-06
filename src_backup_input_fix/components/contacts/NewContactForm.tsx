'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Contact } from '@/types'
import {
  User, Mail, Phone, Building2, MapPin, Globe, 
  LinkedinIcon, TwitterIcon, Target, Briefcase,
  Users, Calendar, DollarSign, Percent, Factory
} from 'lucide-react'

interface ContactFormProps {
  contact?: Partial<Contact>
  onSubmit: (data: Partial<Contact>) => void
  onCancel?: () => void
}

export function NewContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<Contact>>(contact || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Card */}
      <div className="rounded-t-2xl p-6 bg-[#111111] border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Basic Information
        </h3>
        
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <User className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">First Name</div>
                <Input
                  value={formData.first_name || ''}
                  onChange={e => handleChange('first_name', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white w-[140px]"
                  placeholder="Enter first name"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <User className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Last Name</div>
                <Input
                  value={formData.last_name || ''}
                  onChange={e => handleChange('last_name', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white w-[140px]"
                  placeholder="Enter last name"
                />
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Mail className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Email</div>
                <Input
                  value={formData.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Phone className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Phone</div>
                <Input
                  value={formData.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter phone number"
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* Company Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Building2 className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Company</div>
                <Input
                  value={formData.company || ''}
                  onChange={e => handleChange('company', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter company name"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Job Title</div>
                <Input
                  value={formData.job_title || ''}
                  onChange={e => handleChange('job_title', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Card */}
      <div className="p-6 bg-[#111111] border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Additional Information
        </h3>
        
        <div className="space-y-4">
          {/* Lead Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Target className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Lead Status</div>
                <Select
                  value={formData.lead_status || ''}
                  onValueChange={value => handleChange('lead_status', value)}
                >
                  <SelectTrigger className="bg-[#111111] border-none">
                    <SelectValue placeholder="Select lead status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Target className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Lead Source</div>
                <Select
                  value={formData.lead_source || ''}
                  onValueChange={value => handleChange('lead_source', value)}
                >
                  <SelectTrigger className="bg-[#111111] border-none">
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Industry and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Factory className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Industry</div>
                <Input
                  value={formData.industry_id || ''}
                  onChange={e => handleChange('industry_id', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter industry"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Users className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Department</div>
                <Input
                  value={formData.department || ''}
                  onChange={e => handleChange('department', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter department"
                />
              </div>
            </div>
          </div>

          {/* Expected Value and Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Expected Value</div>
                <Input
                  value={formData.expected_value || ''}
                  onChange={e => handleChange('expected_value', parseFloat(e.target.value))}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter expected value"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Percent className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Probability (%)</div>
                <Input
                  value={formData.probability || ''}
                  onChange={e => handleChange('probability', parseInt(e.target.value))}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter probability"
                  type="number"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="rounded-b-2xl p-6 bg-[#111111] border border-white/10 flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-white/70 hover:text-white/90"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[#111111] hover:bg-[#1a1a1a] text-white border border-white/10"
        >
          Create Contact
        </Button>
      </div>
    </form>
  )
} 