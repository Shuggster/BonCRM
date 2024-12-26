'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, Building2, Briefcase } from 'lucide-react'

export function AddContactForm() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-[#1C2333] flex items-center justify-center">
          <User className="w-7 h-7 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Add Contact</h2>
          <p className="text-zinc-400 mt-1">Create a new contact</p>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-400">First Name</label>
            <div className="relative">
              <Input 
                className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
                placeholder="Enter first name"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-400">Last Name</label>
            <div className="relative">
              <Input 
                className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
                placeholder="Enter last name"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Full Width Fields */}
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-zinc-400">Email</label>
          <div className="relative">
            <Input 
              type="email"
              className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
              placeholder="Enter email address"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-medium text-zinc-400">Phone</label>
          <div className="relative">
            <Input 
              type="tel"
              className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
              placeholder="Enter phone number"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          </div>
        </div>

        {/* Company Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-400">Company</label>
            <div className="relative">
              <Input 
                className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
                placeholder="Enter company"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-400">Job Title</label>
            <div className="relative">
              <Input 
                className="h-12 pl-11 bg-[#1C2333] border-transparent hover:border-white/10 focus:border-white/20 text-white" 
                placeholder="Enter job title"
              />
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full h-12 bg-blue-600 text-white rounded-xl font-medium mt-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Create Contact
        </motion.button>
      </form>
    </div>
  )
} 