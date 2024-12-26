'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ContactCardContentProps {
  title: string
  subtitle?: string
}

export function ContactCardContent({ title, subtitle }: ContactCardContentProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {/* Two Column Grid for Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Left Column Fields */}
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">Phone</label>
            <div className="text-white">+1 (484) 288 60 28</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">City</label>
            <div className="text-white">San Francisco, CA, USA</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">Birthday</label>
            <div className="text-white">04.05.1993</div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Right Column Fields */}
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <div className="text-white">crown2919@hotmail.com</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">Address</label>
            <div className="text-white">7804 Rowe Roads</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40">
            <label className="block text-sm text-zinc-400 mb-1">Relation</label>
            <div className="text-white">Brother</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Reminders Section */}
        <section>
          <h3 className="text-lg font-medium text-white mb-4">Reminders</h3>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white">
            Add Reminder +
          </Button>
        </section>

        {/* Events Section */}
        <section>
          <h3 className="text-lg font-medium text-white mb-4">Upcoming events</h3>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white">
            Add Event +
          </Button>
        </section>

        {/* Notes Section */}
        <section>
          <h3 className="text-lg font-medium text-white mb-4">Notes</h3>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white">
            Add Note +
          </Button>
        </section>
      </div>
    </div>
  )
} 