'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Building2, Briefcase, MapPin, Calendar, Users, Tags } from 'lucide-react'
import { ContactTags } from './contact-tags'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  tags: string[]
  avatar?: string
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
    address: '',
    birthday: ''
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
      tags: selectedTags
    }

    onSuccess(newContact)
  }

  const handleChange = (field: string, value: string) => {
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
    value: string
  }) => {
    // Map icons to their respective colors
    const iconColors: { [key: string]: string } = {
      name: 'text-[hsl(330,100%,76%)]', // Contacts pink
      email: 'text-[hsl(217,91%,60%)]', // Leads blue
      phone: 'text-[hsl(280,100%,76%)]', // Dashboard purple
      address: 'text-[hsl(25,95%,64%)]', // Tasks orange
      birthday: 'text-[hsl(142,76%,56%)]', // Calendar green
      company: 'text-[hsl(199,89%,48%)]', // Analytics blue
      role: 'text-[hsl(12,76%,61%)]', // Messages red
      department: 'text-[hsl(280,100%,76%)]', // Dashboard purple
      tags: 'text-[hsl(330,100%,76%)]', // Contacts pink
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
            onChange={(e) => handleChange(name, e.target.value)}
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
      <div className="p-6 space-y-8">
        {/* Personal Information */}
        <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
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
        </div>

        {/* Work Information */}
        <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
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
        </div>

        {/* Additional Information */}
        <div className="rounded-xl p-6 bg-card relative overflow-hidden bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[.05] before:to-transparent">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <InputField
              icon={MapPin}
              label="Address"
              name="address"
              placeholder="Enter address"
              value={formData.address}
            />

            <InputField
              icon={Calendar}
              label="Birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
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
              contactId={undefined} 
              onTagsChange={(tags) => setSelectedTags(tags)} 
            />
          </div>
        </div>

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