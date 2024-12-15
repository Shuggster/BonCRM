"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckSquare, Target, BarChart3, MessageSquare, Clock, CircleDot, LayoutDashboard } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import StickyNotes from '@/components/ui/sticky-note'
import { supabase } from "@/lib/supabase"

interface Contact {
  id: string
  first_name: string
  last_name: string
  created_at: string
}

interface Activity {
  id: string
  message: string
  created_at: string
}

const defaultMetrics = [
  {
    name: "Total Contacts",
    value: "...",
    change: "Loading...",
    icon: Users,
    className: "card-contacts"
  },
  {
    name: "Tasks Completed",
    value: "...",
    change: "Loading...",
    icon: CheckSquare,
    className: "card-tasks"
  },
  {
    name: "Sales Target",
    value: "...",
    change: "Loading...",
    icon: Target,
    className: "card-sales"
  },
  {
    name: "Revenue",
    value: "...",
    change: "Loading...",
    icon: BarChart3,
    className: "card-revenue"
  }
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(75) // 37,500 / 50,000 * 100
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [metrics, setMetrics] = useState(defaultMetrics)

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      console.log('Fetching dashboard data...')
      
      // Fetch contacts without user_id filter
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError.message, contactsError.details)
        throw contactsError
      }

      console.log('Fetched contacts:', contactsData)

      // Calculate contact metrics
      const totalContacts = contactsData?.length || 0
      const previousTotal = totalContacts - (contactsData?.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0)
      const contactChange = previousTotal ? ((totalContacts - previousTotal) / previousTotal * 100).toFixed(1) : '0'

      // Update metrics with real contact data
      setMetrics(prev => prev.map(metric => 
        metric.name === "Total Contacts" 
          ? { ...metric, value: totalContacts.toString(), change: `${contactChange}%` }
          : metric
      ))

      // Create recent activity from new contacts
      const activities = contactsData?.map(contact => ({
        id: contact.id,
        message: `New contact added: ${contact.first_name} ${contact.last_name || ''}`.trim(),
        created_at: contact.created_at
      })) || []

      setContacts(contactsData || [])
      setRecentActivity(activities)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err.message || err, err.details || '')
    }
  }

  if (!mounted) return null

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your CRM activities."
          icon={<div className="icon-dashboard"><LayoutDashboard className="h-6 w-6" /></div>}
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              className={`dashboard-card relative overflow-hidden rounded-xl p-6 ${metric.className}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5">
                  <metric.icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </h3>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="text-2xl font-bold text-primary"
                >
                  {metric.value}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Sales Target Section */}
          <motion.div
            className="dashboard-card rounded-xl p-6 bg-emerald-950/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <CircleDot className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-semibold">Sales Target</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Monthly Goal</span>
                <span className="text-3xl font-bold">£50,000</span>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Current: £37,500</span>
                  <span className="text-muted-foreground">Remaining: £12,500</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div
            className="dashboard-card rounded-xl p-6 bg-indigo-950/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-8">
          <StickyNotes />
        </div>
      </div>
    </main>
  )
}
