'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  User,
  Shield,
  Users2,
  Sparkles
} from "lucide-react"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const isActive = (path: string) => {
    // Handle root path
    if (path === '/') {
      return pathname === path
    }
    
    // Handle admin section
    if (path.startsWith('/admin')) {
      // Check if we're anywhere in the admin section
      return pathname.startsWith(path)
    }
    
    // For other routes, check if the pathname starts with the path
    // but make sure it's a complete path segment
    return pathname.startsWith(path) && 
           (pathname === path || pathname.charAt(path.length) === '/')
  }

  // Icon color mapping
  const iconColors = {
    dashboard: 'group-hover:text-[hsl(280,100%,76%)]', // Purple
    contacts: 'group-hover:text-[hsl(330,100%,76%)]', // Pink
    tools: 'group-hover:text-[hsl(12,76%,61%)]', // Red (reusing messages color)
    calendar: 'group-hover:text-[hsl(142,76%,56%)]', // Green
    tasks: 'group-hover:text-[hsl(25,95%,64%)]', // Orange
    analytics: 'group-hover:text-[hsl(199,89%,48%)]', // Blue
    settings: 'group-hover:text-[hsl(217,91%,60%)]', // Blue
    logout: 'group-hover:text-[hsl(0,84%,60%)]', // Red
    admin: 'group-hover:text-[hsl(280,100%,76%)]' // Purple
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="w-[280px] border-r border-white/[0.08] flex flex-col">
      {/* Logo and Actions */}
      <div className="p-6 flex items-center justify-between">
        <Image
          src="/images/logo-dark.png.png"
          alt="Bonny Mile"
          width={140}
          height={40}
          className="w-auto h-8"
        />
        <div className="flex items-center gap-2">
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
                  <div className="text-sm font-medium text-white">John Doe</div>
                  <div className="text-sm text-white/60">john@example.com</div>
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
                  onSelect={handleSignOut}
                >
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2">
        <div className="space-y-1">
          {/* Main Navigation */}
          <Link href="/dashboard">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/dashboard')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LayoutDashboard className={`w-5 h-5 transition-colors ${iconColors.dashboard}`} />
              Dashboard
            </motion.div>
          </Link>

          <Link href="/contacts">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/contacts')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className={`w-5 h-5 transition-colors ${iconColors.contacts}`} />
              Contacts
            </motion.div>
          </Link>

          <Link href="/calendar">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/calendar')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarDays className={`w-5 h-5 transition-colors ${iconColors.calendar}`} />
              Calendar
            </motion.div>
          </Link>

          <Link href="/tasks">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/tasks')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderKanban className={`w-5 h-5 transition-colors ${iconColors.tasks}`} />
              Tasks
            </motion.div>
          </Link>

          <Link href="/tools">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/tools')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className={`w-5 h-5 transition-colors ${iconColors.tools}`} />
              Tools
            </motion.div>
          </Link>

          <Link href="/analytics">
            <motion.div
              className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                isActive('/analytics')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className={`w-5 h-5 transition-colors ${iconColors.analytics}`} />
              Analytics
            </motion.div>
          </Link>

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-white/[0.08]">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium text-white/40">Admin</h3>
              </div>
              <div className="space-y-1">
                <Link href="/admin/users">
                  <motion.div
                    className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users2 className={`w-5 h-5 transition-colors ${iconColors.admin}`} />
                    User Management
                  </motion.div>
                </Link>

                <Link href="/admin/teams">
                  <motion.div
                    className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive('/admin/teams')
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className={`w-5 h-5 transition-colors ${iconColors.admin}`} />
                    Team Management
                  </motion.div>
                </Link>

                <Link href="/admin/roles">
                  <motion.div
                    className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive('/admin/roles')
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield className={`w-5 h-5 transition-colors ${iconColors.admin}`} />
                    Role Management
                  </motion.div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto border-t border-white/[0.08]">
        <div className="space-y-1">
          <Link href="/settings">
            <motion.div
              className="group flex items-center gap-3 px-4 py-2 text-sm font-medium text-white/60 rounded-xl hover:text-white hover:bg-white/[0.06] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className={`w-5 h-5 transition-colors ${iconColors.settings}`} />
              Settings
            </motion.div>
          </Link>

          <button className="w-full" onClick={handleSignOut}>
            <motion.div
              className="group flex items-center gap-3 px-4 py-2 text-sm font-medium text-white/60 rounded-xl hover:text-white hover:bg-white/[0.06] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className={`w-5 h-5 transition-colors ${iconColors.logout}`} />
              Log out
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  )
} 