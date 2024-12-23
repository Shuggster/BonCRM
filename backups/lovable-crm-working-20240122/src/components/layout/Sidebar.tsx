'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare,
  Target,
  Calendar,
  MessageSquare,
  Wrench,
  Menu,
  X,
  Shield,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ShugbotButton } from '@/components/ai/shugbot-button'
import { useSidebar } from '@/contexts/sidebar-context'

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
    name: "Goals",
    href: "/goals",
    icon: Target,
    iconClass: "icon-goals",
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
    name: "Tools",
    href: "/tools",
    icon: Wrench,
    iconClass: "icon-tools",
  },
]

const adminNavigation = [
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    iconClass: "icon-users",
  },
  {
    name: "Role Management",
    href: "/admin/roles",
    icon: Shield,
    iconClass: "icon-roles",
  },
  {
    name: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    iconClass: "icon-settings",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, isMobile } = useSidebar()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const renderNavItems = (items: typeof navigation) => {
    return items.map((item) => {
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
            className={`nav-item flex items-center gap-3 ${
              isActive ? 'text-white bg-white/[0.08]' : ''
            }`}
            onClick={() => {
              if (isMobile) {
                setIsOpen(false)
              }
            }}
          >
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`p-1 rounded-md ${item.iconClass}`}
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
            {isOpen && <span>{item.name}</span>}
            {isActive && isOpen && (
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
    })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        className={`${isMobile ? 'fixed' : 'relative'} z-40 bg-background`}
        initial={false}
        animate={{
          width: isOpen ? "288px" : isMobile ? "0px" : "72px",
          x: isOpen || !isMobile ? 0 : -288
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex h-full">
          <div className="flex h-screen w-full flex-col gap-4 border-r border-border/40 bg-background px-3 pb-3 pt-16">
            <nav className="sidebar-nav flex flex-1 flex-col gap-1 p-2">
              {renderNavItems(navigation)}
              
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  {isOpen && (
                    <div className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                      Admin
                    </div>
                  )}
                  {renderNavItems(adminNavigation)}
                </div>
              )}
            </nav>

            {isOpen && (
              <div className="px-2">
                <ShugbotButton />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
