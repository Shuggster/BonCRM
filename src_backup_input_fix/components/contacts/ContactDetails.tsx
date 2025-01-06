'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, Building2, Briefcase, MapPin, Calendar, Users, Plus, Heart } from 'lucide-react'

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

interface ContactDetailsProps {
  contact: Contact
  onEdit: () => void
}

export function ContactDetails({ contact, onEdit }: ContactDetailsProps) {
  return (
    <div className="relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/0 pointer-events-none" />

      <div className="relative p-6">
        {/* Contact Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <motion.div
            className="p-4 bg-black/40 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 text-sm mb-4">
              <Mail className="w-4 h-4 text-blue-400" />
              <a href={`mailto:${contact.email}`} className="text-blue-400 hover:underline">
                {contact.email}
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm mb-4">
              <Phone className="w-4 h-4 text-blue-400" />
              <a href={`tel:${contact.phone}`} className="text-blue-400 hover:underline">
                {contact.phone}
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm mb-4">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">San Francisco, CA</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">04.05.1993</span>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="p-4 bg-black/40 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 text-sm mb-4">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">{contact.company}</span>
            </div>

            <div className="flex items-center gap-3 text-sm mb-4">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">{contact.role}</span>
            </div>

            <div className="flex items-center gap-3 text-sm mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">Family</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Heart className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-100">Brother</span>
            </div>
          </motion.div>
        </div>

        {/* Reminders Section */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Reminders</h3>
            <motion.button
              className="p-1 hover:bg-white/[0.05] rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center">
                {contact.avatar || contact.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm">Call <span className="text-blue-400">{contact.name}</span> to discuss a present for mom</div>
                <div className="text-xs text-zinc-500 mt-1">03.18, 11:00 AM</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events Section */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Upcoming events</h3>
            <motion.button
              className="p-1 hover:bg-white/[0.05] rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl">
              <div className="flex-1">
                <div className="text-sm"><span className="text-blue-400">{contact.name}'s</span> Birthday Party</div>
                <div className="text-xs text-zinc-500 mt-1">6:00 PM</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-xs">
                  👥
                </div>
                <span className="text-xs text-zinc-400">+16</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Notes</h3>
            <motion.button
              className="p-1 hover:bg-white/[0.05] rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 bg-black/40 rounded-xl">
              <div className="text-sm">Gift Ideas</div>
              <div className="text-xs text-zinc-500 mt-1">
                Need to start thinking about some gift ideas for mom. I thought it would be great if we brainstormed some ideas together and came up with something that she would really love. Maybe getting her tickets to a show or concert...
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 