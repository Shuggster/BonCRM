'use client'

import { Bell, User } from 'lucide-react'
import { motion } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function Header() {
  return (
    <div className="h-16 border-b border-white/[0.08] flex items-center justify-end px-6 gap-2">
      {/* Notifications */}
      <motion.button
        className="relative p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
      </motion.button>

      {/* User Profile */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <motion.button
            className="flex items-center gap-2 p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
          </motion.button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[200px] bg-zinc-900 rounded-xl p-1 shadow-xl border border-white/[0.08]"
            sideOffset={5}
            align="end"
          >
            <div className="px-3 py-2">
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-zinc-400">john@example.com</div>
            </div>
            <DropdownMenu.Separator className="h-px bg-white/[0.08] my-1" />
            <DropdownMenu.Item
              className="text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-lg cursor-pointer outline-none"
            >
              Profile Settings
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-lg cursor-pointer outline-none"
            >
              Preferences
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-white/[0.08] my-1" />
            <DropdownMenu.Item
              className="text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.06] px-3 py-2 rounded-lg cursor-pointer outline-none"
            >
              Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
} 