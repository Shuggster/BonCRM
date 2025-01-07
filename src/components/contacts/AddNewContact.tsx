'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Briefcase, MapPin, Calendar, Users, Tags, Globe, Twitter, Linkedin, DollarSign, Target, BarChart } from 'lucide-react'
import { ContactTags } from './contact-tags'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from "@/components/ui/card"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  tags: string[]
  avatar?: string
  // Additional fields
  department: string
  website: string
  linkedin: string
  twitter: string
  address1: string
  address2: string
  city: string
  leadStatus: string
  leadSource: string
  leadScore: number
  expectedValue: number
}

interface AddNewContactProps {
  onSuccess: (contact: Contact) => void
}

export function AddNewContact({ onSuccess }: AddNewContactProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    department: '',
    website: '',
    linkedin: '',
    twitter: '',
    address1: '',
    address2: '',
    city: '',
    leadStatus: '',
    leadSource: '',
    leadScore: 0,
    expectedValue: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create new contact
    const newContact: Contact = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      role: formData.role,
      department: formData.department,
      website: formData.website,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      leadStatus: formData.leadStatus,
      leadSource: formData.leadSource,
      leadScore: formData.leadScore,
      expectedValue: formData.expectedValue,
      tags: selectedTags
    }

    onSuccess(newContact)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const InputField = ({ 
    icon: Icon, 
    label, 
    name, 
    type = 'text',
    placeholder,
    required = false,
    value
  }: { 
    icon: any
    label: string
    name: string
    type?: string
    placeholder?: string
    required?: boolean
    value: string | number
  }) => {
    // Map icons to their respective colors
    const iconColors: { [key: string]: string } = {
      name: 'text-[hsl(330,100%,76%)]',
      email: 'text-[hsl(217,91%,60%)]',
      phone: 'text-[hsl(280,100%,76%)]',
      address1: 'text-[hsl(25,95%,64%)]',
      address2: 'text-[hsl(25,95%,64%)]',
      city: 'text-[hsl(25,95%,64%)]',
      company: 'text-[hsl(199,89%,48%)]',
      role: 'text-[hsl(12,76%,61%)]',
      department: 'text-[hsl(280,100%,76%)]',
      website: 'text-[hsl(217,91%,60%)]',
      linkedin: 'text-[hsl(217,91%,60%)]',
      twitter: 'text-[hsl(217,91%,60%)]',
      leadStatus: 'text-[hsl(142,76%,56%)]',
      leadSource: 'text-[hsl(142,76%,56%)]',
      leadScore: 'text-[hsl(142,76%,56%)]',
      expectedValue: 'text-[hsl(142,76%,56%)]',
      tags: 'text-[hsl(330,100%,76%)]',
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">{label}</label>
        <div className="group flex items-center gap-2 px-3 py-2 bg-black/60 rounded-xl border border-white/[0.08] hover:border-white/20 focus-within:border-blue-500/50">
          <Icon className={`w-4 h-4 ${iconColors[name] || 'text-zinc-500'} transition-colors`} />
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => handleChange(name, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
            required={required}
            autoComplete="off"
          />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-black/60">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="social">Social & Web</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="sales">Sales Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Personal Information */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <InputField
                  icon={User}
                  label="Name"
                  name="name"
                  placeholder="Enter name"
                  required
                  value={formData.name}
                />
                <InputField
                  icon={Mail}
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                  value={formData.email}
                />
                <InputField
                  icon={Phone}
                  label="Phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                />
              </div>
            </Card>

            {/* Work Information */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Work Information
              </h3>
              <div className="space-y-4">
                <InputField
                  icon={Building2}
                  label="Company"
                  name="company"
                  placeholder="Enter company"
                  value={formData.company}
                />
                <InputField
                  icon={Briefcase}
                  label="Role"
                  name="role"
                  placeholder="Enter role"
                  value={formData.role}
                />
                <InputField
                  icon={Users}
                  label="Department"
                  name="department"
                  placeholder="Enter department"
                  value={formData.department}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                Online Presence
              </h3>
              <div className="space-y-4">
                <InputField
                  icon={Globe}
                  label="Website URL"
                  name="website"
                  placeholder="Enter website URL"
                  value={formData.website}
                />
                <InputField
                  icon={Linkedin}
                  label="LinkedIn Profile"
                  name="linkedin"
                  placeholder="Enter LinkedIn profile URL"
                  value={formData.linkedin}
                />
                <InputField
                  icon={Twitter}
                  label="Twitter Handle"
                  name="twitter"
                  placeholder="Enter Twitter handle"
                  value={formData.twitter}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-6 mt-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Location Details
              </h3>
              <div className="space-y-4">
                <InputField
                  icon={MapPin}
                  label="Address Line 1"
                  name="address1"
                  placeholder="Enter address line 1"
                  value={formData.address1}
                />
                <InputField
                  icon={MapPin}
                  label="Address Line 2"
                  name="address2"
                  placeholder="Enter address line 2"
                  value={formData.address2}
                />
                <InputField
                  icon={MapPin}
                  label="City"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Lead Information
              </h3>
              <div className="space-y-4">
                <InputField
                  icon={Target}
                  label="Lead Status"
                  name="leadStatus"
                  placeholder="Enter lead status"
                  value={formData.leadStatus}
                />
                <InputField
                  icon={BarChart}
                  label="Lead Source"
                  name="leadSource"
                  placeholder="Enter lead source"
                  value={formData.leadSource}
                />
                <InputField
                  icon={BarChart}
                  label="Lead Score"
                  name="leadScore"
                  type="number"
                  placeholder="Enter lead score"
                  value={formData.leadScore}
                />
                <InputField
                  icon={DollarSign}
                  label="Expected Value"
                  name="expectedValue"
                  type="number"
                  placeholder="Enter expected value"
                  value={formData.expectedValue}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tags */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Tags className="w-5 h-5 text-indigo-500" />
            Tags
          </h3>
          <div className="space-y-4">
            <ContactTags 
              contactId={undefined} 
              onTagsChange={(tags) => setSelectedTags(tags)} 
            />
          </div>
        </Card>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl text-sm font-medium transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add Contact
        </motion.button>
      </div>
    </form>
  )
} 