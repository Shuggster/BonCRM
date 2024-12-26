'use client'

import { useState } from 'react'
import { Mail, Phone, Building2, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Contact } from '@/types'

interface EditContactProps {
  contact: Contact
  section?: 'upper' | 'lower'
  onSave?: (data: Partial<Contact>) => void
  onCancel?: () => void
}

export function EditContact({ contact, section = 'upper', onSave, onCancel }: EditContactProps) {
  const [formData, setFormData] = useState({
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || '',
    job_title: contact.job_title || '',
    department: contact.department || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave?.(formData)
  }

  const cardClasses = "relative overflow-hidden bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]"

  if (section === 'upper') {
    return (
      <div className={`${cardClasses} h-full`}>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">First Name</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-black/60"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Last Name</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-black/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-black/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 bg-black/60"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`${cardClasses} h-full`}>
      <form className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Company</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <Input
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="pl-10 bg-black/60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Job Title</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <Input
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              className="pl-10 bg-black/60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Department</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <Input
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="pl-10 bg-black/60"
            />
          </div>
        </div>
      </form>
    </div>
  )
} 