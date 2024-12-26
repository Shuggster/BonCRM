'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Plus, Mail, Phone, Building2, User2, Briefcase } from 'lucide-react'

interface QuickAddContactProps {
  onSuccess: (data: any) => void
  section?: 'top' | 'bottom'
}

export function QuickAddContact({ onSuccess, section = 'top' }: QuickAddContactProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess(formData)
  }

  const containerClasses = "relative overflow-hidden h-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl border border-white/[0.05]"
  const inputClasses = "h-14 bg-black/40 pl-12 border-0 text-white hover:bg-black/60 transition-colors rounded-xl focus:ring-1 focus:ring-white/10"
  const labelClasses = "text-[15px] text-zinc-400 font-medium block mb-3"
  const iconClasses = "w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"

  // Top section content
  if (section === 'top') {
    return (
      <div className={`${containerClasses} rounded-t-2xl`}>
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/[0.05] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white">Add Contact</h2>
              <p className="text-zinc-500">Create a new contact</p>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className={labelClasses}>First Name</label>
                <div className="relative">
                  <User2 className={`${iconClasses} text-blue-500`} />
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Last Name</label>
                <div className="relative">
                  <User2 className={`${iconClasses} text-blue-500`} />
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Email</label>
              <div className="relative">
                <Mail className={`${iconClasses} text-blue-500`} />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Bottom section content
  return (
    <div className={`${containerClasses} rounded-b-2xl`}>
      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div>
          <label className={labelClasses}>Phone</label>
          <div className="relative">
            <Phone className={`${iconClasses} text-blue-500`} />
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className={labelClasses}>Company</label>
            <div className="relative">
              <Building2 className={`${iconClasses} text-blue-500`} />
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Job Title</label>
            <div className="relative">
              <Briefcase className={`${iconClasses} text-blue-500`} />
              <Input
                value={formData.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          className="w-full h-14 bg-black/40 text-white/90 rounded-xl font-medium mt-8 hover:bg-black/60 transition-colors border border-white/[0.05] flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Create Contact
          <Plus className="w-4 h-4 opacity-80" />
        </motion.button>
      </form>
    </div>
  )
} 