'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShugBotButton } from '@/components/Shugbot/ShugBotButton'
import { ShugBotPopup } from '@/components/Shugbot/ShugBotPopup'

export function Sidebar() {
  const [isShugBotOpen, setIsShugBotOpen] = useState(false)

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {/* Your existing navigation items */}
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/contacts">Contacts</Link></li>
        <li><Link href="/calendar">Calendar</Link></li>
      </ul>
      
      {/* Add ShugBotButton to the sidebar */}
      <div className="mt-auto">
        <ShugBotButton onClick={() => setIsShugBotOpen(true)} />
      </div>

      {/* ShugBotPopup */}
      <ShugBotPopup isOpen={isShugBotOpen} onClose={() => setIsShugBotOpen(false)} />
    </nav>
  )
}

