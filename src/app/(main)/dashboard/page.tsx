"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckSquare, Target, BarChart3, MessageSquare, Clock, CircleDot, LayoutDashboard, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import StickyNotes from '@/components/ui/sticky-note'
import { supabase } from "@/lib/supabase"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string
}

interface Event {
  id: string
  title: string
  date: string
  event_type: string
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(75)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [metrics, setMetrics] = useState(defaultMetrics)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [taskStats, setTaskStats] = useState<{ name: string; value: number }[]>([])
  const [contactGrowth, setContactGrowth] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      console.log('Fetching dashboard data...')
      
      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (contactsError) throw contactsError

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })

      if (tasksError) throw tasksError

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5)

      if (eventsError) throw eventsError

      // Process tasks stats
      const taskStatusCount = tasksData?.reduce((acc: any, task: Task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {})

      const taskStatsData = Object.entries(taskStatusCount || {}).map(([name, value]) => ({
        name,
        value: value as number
      }))

      // Process contact growth
      const contactsByDate = contactsData?.reduce((acc: any, contact: Contact) => {
        const date = new Date(contact.created_at).toLocaleDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const contactGrowthData = Object.entries(contactsByDate || {})
        .slice(-7)
        .map(([date, count]) => ({
          date,
          count: count as number
        }))

      // Update all states
      setContacts(contactsData || [])
      setTasks(tasksData || [])
      setEvents(eventsData || [])
      setTaskStats(taskStatsData || [])
      setContactGrowth(contactGrowthData || [])

      // Update metrics
      const totalContacts = contactsData?.length || 0
      const completedTasks = tasksData?.filter((t: Task) => t.status === 'completed').length || 0
      const totalTasks = tasksData?.length || 0

      setMetrics(prev => prev.map(metric => {
        if (metric.name === "Total Contacts") {
          return { ...metric, value: totalContacts.toString() }
        }
        if (metric.name === "Tasks Completed") {
          return { ...metric, value: `${completedTasks}/${totalTasks}` }
        }
        return metric
      }))

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err.message)
    }
  }

  if (!mounted) return null

  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1600px] p-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your CRM activities."
          icon={<div className="icon-dashboard"><LayoutDashboard className="h-6 w-6" /></div>}
        />

        {/* Metrics Cards - 12 column grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              className={`lg:col-span-3 dashboard-card relative overflow-hidden rounded-xl p-6 ${metric.className}`}
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
                <div className="text-2xl font-bold text-primary">
                  {metric.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tasks and Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Tasks Overview */}
          <motion.div
            className="lg:col-span-6 dashboard-card rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Tasks Overview</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Upcoming Tasks</h3>
              <div className="space-y-2">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span>{task.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Calendar Preview */}
          <motion.div
            className="lg:col-span-6 dashboard-card rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
            </div>
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                    {event.event_type}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Contact Growth and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Contact Growth Chart */}
          <motion.div
            className="lg:col-span-8 dashboard-card rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Contact Growth</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contactGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="lg:col-span-4 dashboard-card rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map(activity => (
                <div key={activity.id} className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm">{activity.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

function formatTimeAgo(dateString: string) {
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
