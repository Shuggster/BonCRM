'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Contact, LeadStatus, LeadSource, ConversionStatus } from '@/types'
import {
  User, Mail, Phone, Building2, MapPin, Globe, 
  LinkedinIcon, TwitterIcon, Target, Briefcase,
  Users, Calendar, DollarSign, Percent
} from 'lucide-react'

interface ContactFormProps {
  contact?: Partial<Contact>
  onSubmit: (data: Partial<Contact>) => void
  onCancel?: () => void
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
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
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="social">Social & Web</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="sales">Sales Info</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={e => handleChange('first_name', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={e => handleChange('last_name', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={e => handleChange('company', e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title || ''}
                onChange={e => handleChange('job_title', e.target.value)}
                placeholder="Job Title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department || ''}
              onChange={e => handleChange('department', e.target.value)}
              placeholder="Department"
            />
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website || ''}
              onChange={e => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin || ''}
              onChange={e => handleChange('linkedin', e.target.value)}
              placeholder="LinkedIn Profile URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={formData.twitter || ''}
              onChange={e => handleChange('twitter', e.target.value)}
              placeholder="Twitter Handle"
            />
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1 || ''}
              onChange={e => handleChange('address_line1', e.target.value)}
              placeholder="Street Address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2 || ''}
              onChange={e => handleChange('address_line2', e.target.value)}
              placeholder="Apt, Suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region/State</Label>
              <Input
                id="region"
                value={formData.region || ''}
                onChange={e => handleChange('region', e.target.value)}
                placeholder="Region or State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postal Code</Label>
              <Input
                id="postcode"
                value={formData.postcode || ''}
                onChange={e => handleChange('postcode', e.target.value)}
                placeholder="Postal Code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={e => handleChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_status">Lead Status</Label>
              <select
                id="lead_status"
                value={formData.lead_status || ''}
                onChange={e => handleChange('lead_status', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-lg text-white"
              >
                <option value="">Select Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_source">Lead Source</Label>
              <select
                id="lead_source"
                value={formData.lead_source || ''}
                onChange={e => handleChange('lead_source', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-lg text-white"
              >
                <option value="">Select Source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_value">Expected Value</Label>
              <Input
                id="expected_value"
                type="number"
                value={formData.expected_value || ''}
                onChange={e => handleChange('expected_value', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability || ''}
                onChange={e => handleChange('probability', parseInt(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_contact_date">First Contact Date</Label>
              <Input
                id="first_contact_date"
                type="datetime-local"
                value={formData.first_contact_date || ''}
                onChange={e => handleChange('first_contact_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_follow_up">Next Follow-up</Label>
              <Input
                id="next_follow_up"
                type="datetime-local"
                value={formData.next_follow_up || ''}
                onChange={e => handleChange('next_follow_up', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t border-white/[0.08]">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          Save Contact
        </Button>
      </div>
    </form>
  )
} 