'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare,
  Target,
  Calendar,
  MessageSquare,
  BarChart3
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ShugbotButton } from '@/components/ai/shugbot-button'

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconClass: "icon-dashboard",
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users,
    iconClass: "icon-contacts",
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    iconClass: "icon-tasks",
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Target,
    iconClass: "icon-leads",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    iconClass: "icon-calendar",
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageSquare,
    iconClass: "icon-messages",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    iconClass: "icon-analytics",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[60px] items-center px-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl font-bold">Bonnymans</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3 py-4">
        <AnimatePresence>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all relative group ${
                    isActive 
                      ? 'text-white' 
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-1 rounded-md ${item.iconClass} ${isActive ? 'bg-white/10' : ''} 
                      group-hover:bg-white/5 transition-colors`}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-white/[0.08]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </nav>
      <div className="mt-auto p-4">
        <ShugbotButton />
      </div>
    </div>
  )
}
