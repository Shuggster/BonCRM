"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckSquare, Target, BarChart3, MessageSquare, Calendar, Phone, Mail, Video, ArrowRight, ListTodo, Building2, XCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import PageTransition from '@/components/animations/PageTransition'

interface DashboardMetric {
  id: string
  name: string
  value: string
  change: string
  icon: any
  className: string
}

const defaultMetrics: DashboardMetric[] = [
  {
    id: '1',
    name: "Total Contacts",
    value: "...",
    change: "...",
    icon: Users,
    className: "bg-gradient-to-br from-pink-500/30 to-pink-500/10 hover:from-pink-500/40 hover:to-pink-500/20 transition-all"
  },
  {
    id: '2',
    name: "Tasks Completed",
    value: "...",
    change: "...",
    icon: CheckSquare,
    className: "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 hover:from-emerald-500/40 hover:to-emerald-500/20 transition-all"
  },
  {
    id: '3',
    name: "Active Tasks",
    value: "...",
    change: "...",
    icon: Target,
    className: "bg-gradient-to-br from-blue-500/30 to-blue-500/10 hover:from-blue-500/40 hover:to-blue-500/20 transition-all"
  },
  {
    id: '4',
    name: "Scheduled Activities",
    value: "...",
    change: "...",
    icon: BarChart3,
    className: "bg-gradient-to-br from-violet-500/30 to-violet-500/10 hover:from-violet-500/40 hover:to-violet-500/20 transition-all"
  }
]

// Add notification type
interface Notification {
  id: string;
  message: string;
  description?: string;
  type: 'success' | 'info' | 'error';
  icon?: React.ReactNode;
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetric[]>(defaultMetrics)
  const [tasks, setTasks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const { setContentAndShow, hide } = useSplitViewStore()
  const supabase = createClientComponentClient()
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetric | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMetricClick, setPendingMetricClick] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isDataReady, setIsDataReady] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])

  // Format date for activities
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Add helper function for due dates
  const getTaskDueStatus = useCallback((dueDate: string | null) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', class: 'bg-red-500/20 text-red-400' };
    if (diffDays === 0) return { label: 'Due today', class: 'bg-yellow-500/20 text-yellow-400' };
    if (diffDays === 1) return { label: 'Due tomorrow', class: 'bg-orange-500/20 text-orange-400' };
    if (diffDays <= 7) return { label: `Due in ${diffDays} days`, class: 'bg-blue-500/20 text-blue-400' };
    return { label: formatDate(dueDate), class: 'bg-zinc-500/20 text-zinc-400' };
  }, [formatDate]);

  const getPriorityIndicator = useCallback((priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { color: 'bg-red-500', label: 'High Priority' };
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Medium Priority' };
      case 'low':
        return { color: 'bg-green-500', label: 'Low Priority' };
      default:
        return { color: 'bg-zinc-500', label: 'No Priority Set' };
    }
  }, []);

  // Add helper function for calculating week-over-week changes
  const calculateWeeklyChange = useCallback((currentCount: number, previousCount: number) => {
    if (previousCount === 0) return '+100%';
    const percentChange = ((currentCount - previousCount) / previousCount) * 100;
    return `${percentChange > 0 ? '+' : ''}${Math.round(percentChange)}%`;
  }, []);

  const handleMetricClick = useCallback(
    (metric: DashboardMetric) => {
      hide()
      
      setTimeout(() => {
        const topContent = (
          <motion.div 
            key={metric.id}
            className="h-full bg-[#111111] rounded-t-2xl"
            initial={{ y: "-100%" }}
            animate={{ 
              y: 0,
              transition: {
                type: "tween",
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                  <metric.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{metric.name}</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-sm font-medium text-zinc-400">
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

        const bottomContent = (
          <motion.div 
            key={`${metric.id}-bottom`}
            className="h-full bg-[#111111] rounded-b-2xl"
            initial={{ y: "100%" }}
            animate={{ 
              y: 0,
              transition: {
                type: "tween",
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            <div className="p-8 border-t border-white/[0.03]">
              <div className="space-y-6">
                {metric.name === "Total Contacts" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Contacts</h3>
                    {contacts.map((contact, index) => (
                      <motion.div 
                        key={contact.id} 
                        className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] cursor-pointer hover:bg-white/[0.02] transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                        onClick={() => {
                          // Show contact details in split view
                          setContentAndShow(
                            <motion.div 
                              className="h-full bg-[#111111] rounded-t-xl p-6"
                              initial={{ y: "-100%" }}
                              animate={{ y: 0 }}
                              transition={{ type: "tween", duration: 0.4 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h2 className="text-xl font-semibold text-white">{contact.first_name} {contact.last_name}</h2>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm text-zinc-400">{contact.job_title}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                {contact.phone && (
                                  <a 
                                    href={`tel:${contact.phone}`}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                    title="Call"
                                  >
                                    <Phone className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
                                  </a>
                                )}
                                {contact.email && (
                                  <a 
                                    href={`mailto:${contact.email}`}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                    title="Send email"
                                  >
                                    <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
                                  </a>
                                )}
                              </div>
                            </motion.div>,
                            <motion.div 
                              className="h-full bg-[#111111] rounded-b-xl p-6 border-t border-white/[0.08]"
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              transition={{ type: "tween", duration: 0.4 }}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {contact.company && (
                                        <p className="text-sm text-zinc-400 flex items-center gap-1">
                                          <Building2 className="w-3 h-3" />
                                          {contact.company}
                                        </p>
                                      )}
                                      {contact.job_title && (
                                        <p className="text-sm text-zinc-400">{contact.job_title}</p>
                                      )}
                                    </div>
                                    {contact.scheduled_activities?.[0] && (
                                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Last interaction: {formatDate(contact.scheduled_activities[0].created_at)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  {contact.phone && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                                      <Phone className="w-5 h-5 text-blue-500" />
                                      <div>
                                        <div className="text-sm text-zinc-400">Phone</div>
                                        <div className="text-white">{contact.phone}</div>
                                      </div>
                                    </div>
                                  )}
                                  {contact.email && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                                      <Mail className="w-5 h-5 text-blue-500" />
                                      <div>
                                        <div className="text-sm text-zinc-400">Email</div>
                                        <div className="text-white">{contact.email}</div>
                                      </div>
                                    </div>
                                  )}
                                  {contact.company && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                                      <Building2 className="w-5 h-5 text-blue-500" />
                                      <div>
                                        <div className="text-sm text-zinc-400">Company</div>
                                        <div className="text-white">{contact.company}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>,
                            `contact-${contact.id}`
                          )
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {contact.company && (
                                <p className="text-sm text-zinc-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {contact.company}
                                </p>
                              )}
                              {contact.job_title && (
                                <p className="text-sm text-zinc-400">{contact.job_title}</p>
                              )}
                            </div>
                            {contact.scheduled_activities?.[0] && (
                              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Last interaction: {formatDate(contact.scheduled_activities[0].created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {metric.name === "Tasks Completed" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Completed Tasks</h3>
                    {tasks.filter(t => t.status === 'completed').map((task, index) => (
                      <motion.div 
                        key={task.id} 
                        className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              {task.priority && (
                                <div 
                                  className={`w-2 h-2 rounded-full ${getPriorityIndicator(task.priority).color}`} 
                                  title={getPriorityIndicator(task.priority).label}
                                />
                              )}
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">completed</span>
                            {task.due_date && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getTaskDueStatus(task.due_date)?.class}`}>
                                {getTaskDueStatus(task.due_date)?.label}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleTaskStatusUpdate(task.id, 'in-progress')}
                            className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Move to In Progress
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {metric.name === "Active Tasks" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">In Progress Tasks</h3>
                    {tasks.filter(t => t.status === 'in-progress').map((task, index) => (
                      <motion.div 
                        key={task.id} 
                        className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              {task.priority && (
                                <div 
                                  className={`w-2 h-2 rounded-full ${getPriorityIndicator(task.priority).color}`} 
                                  title={getPriorityIndicator(task.priority).label}
                                />
                              )}
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">in progress</span>
                            {task.due_date && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getTaskDueStatus(task.due_date)?.class}`}>
                                {getTaskDueStatus(task.due_date)?.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                              className="text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleTaskStatusUpdate(task.id, 'todo')}
                              className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                            >
                              Move to Todo
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {metric.name === "Scheduled Activities" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Upcoming Activities</h3>
                    {activities.map((activity, index) => (
                      <motion.div 
                        key={activity.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{activity.title}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                activity.type === 'call' ? 'bg-emerald-500/20 text-emerald-400' :
                                activity.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {activity.type}
                              </span>
                            </div>
                            {activity.contact && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-sm text-zinc-400">
                                  <Users className="w-3 h-3" />
                                  {activity.contact.first_name} {activity.contact.last_name}
                                </div>
                                {activity.contact.company && (
                                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                                    <Building2 className="w-3 h-3" />
                                    {activity.contact.company}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-zinc-500">{formatDate(activity.scheduled_for)}</p>
                              <div className="flex items-center gap-1">
                                {activity.type === 'call' && activity.contact?.phone && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `tel:${activity.contact.phone}`;
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                    title="Call contact"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </button>
                                )}
                                {activity.type === 'email' && activity.contact?.email && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `mailto:${activity.contact.email}`;
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="Send email"
                                  >
                                    <Mail className="w-3 h-3" />
                                  </button>
                                )}
                                {activity.type === 'meeting' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open('https://meet.google.com/new', '_blank');
                                    }}
                                    className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                    title="Start meeting"
                                  >
                                    <Video className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )

        setContentAndShow(topContent, bottomContent, metric.id)
      }, 100)
    },
    [hide, setContentAndShow, activities, tasks, formatDate, contacts]
  )

  // Handle notification clicks
  const handleNotificationClick = useCallback((type: string, id: string) => {
    setPendingMetricClick(type);
  }, []);

  // Effect to handle pending metric clicks
  useEffect(() => {
    if (pendingMetricClick) {
      const metricToShow = pendingMetricClick === 'task' 
        ? metrics.find(m => m.name === "Tasks Completed")
        : pendingMetricClick === 'activity'
        ? metrics.find(m => m.name === "Scheduled Activities")
        : metrics.find(m => m.name === "Total Contacts");

      if (metricToShow) {
        handleMetricClick(metricToShow);
      }
      setPendingMetricClick(null);
    }
  }, [pendingMetricClick, metrics, handleMetricClick]);

  // Add notification handler
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    console.log('Adding notification:', notification);
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => {
      console.log('Previous notifications:', prev);
      const newNotifications = [...prev, { ...notification, id }];
      console.log('New notifications:', newNotifications);
      return newNotifications;
    });
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Update fetchDashboardData to set data ready state
  const fetchDashboardData = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        console.log('No session available, skipping data fetch');
        return;
      }

      console.log('Fetching dashboard data...', { sessionId: session?.user?.id });
      setIsLoading(true);

      // Get current date ranges
      const now = new Date();
      const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      // Fetch contacts with weekly comparison
      const [currentContacts, previousContacts, totalContactsCount] = await Promise.all([
        supabase
          .from('contacts')
          .select(`
            *,
            scheduled_activities (
              id,
              type,
              scheduled_for,
              created_at
            )
          `)
          .gte('created_at', startOfThisWeek.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('contacts')
          .select('id')
          .gte('created_at', startOfLastWeek.toISOString())
          .lt('created_at', startOfThisWeek.toISOString()),
        supabase
          .from('contacts')
          .select('count', { count: 'exact', head: true })
      ]);

      // Fetch tasks with completion rates
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(15);

      // Fetch activities with engagement metrics
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('scheduled_activities')
        .select(`
          *,
          contacts (
            id,
            first_name,
            last_name,
            company,
            job_title,
            email,
            phone
          )
        `)
        .gte('scheduled_for', startOfThisWeek.toISOString())
        .order('scheduled_for', { ascending: true });

      if (currentContacts.error) throw currentContacts.error;
      if (tasksError) throw tasksError;
      if (activitiesError) throw activitiesError;

      // Calculate metrics
      const thisWeekContacts = currentContacts.data?.length || 0;
      const lastWeekContacts = previousContacts.data?.length || 0;
      const contactsChange = calculateWeeklyChange(thisWeekContacts, lastWeekContacts);
      const totalContacts = totalContactsCount.count || 0;

      const tasks = tasksData || [];
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
      const pendingTasks = tasks.filter(t => t.status === 'todo').length;

      const activities = activitiesData || [];
      const upcomingActivities = activities.filter(a => new Date(a.scheduled_for) > now).length;
      const todayActivities = activities.filter(a => {
        const activityDate = new Date(a.scheduled_for);
        return activityDate.toDateString() === now.toDateString();
      }).length;

      // Update states
      setContacts(currentContacts.data || []);
      setTasks(tasks);
      setActivities(activities?.slice(0, 3).map(activity => {
        let icon;
        switch (activity.type) {
          case 'call':
            icon = Phone;
            break;
          case 'email':
            icon = Mail;
            break;
          case 'meeting':
            icon = Video;
            break;
          default:
            icon = ArrowRight;
        }
        
        return {
          id: activity.id,
          title: activity.title,
          type: activity.type,
          scheduled_for: activity.scheduled_for,
          icon,
          contact: activity.contacts
        };
      }) || []);

      // Update metrics with enhanced data
      setMetrics(prev => prev.map(metric => {
        if (metric.name === "Total Contacts") {
          return {
            ...metric,
            value: totalContacts.toString(),
            change: `${contactsChange} this week`
          };
        }
        if (metric.name === "Tasks Completed") {
          return {
            ...metric,
            value: `${completedTasks}/${totalTasks}`,
            change: `${completionRate}% completion rate`
          };
        }
        if (metric.name === "Active Tasks") {
          return {
            ...metric,
            value: activeTasks.toString(),
            change: `${pendingTasks} pending`
          };
        }
        if (metric.name === "Scheduled Activities") {
          return {
            ...metric,
            value: upcomingActivities.toString(),
            change: `${todayActivities} today`
          };
        }
        return metric;
      }));

      setIsLoading(false);
      setIsDataReady(true);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
      setIsDataReady(true);
    }
  }, [supabase, session, calculateWeeklyChange]);

  // Update subscription handlers
  useEffect(() => {
    console.log('Setting up subscriptions - START');
    
    if (!session?.user?.id) {
      console.log('No user session, skipping subscriptions');
      return;
    }

    const supabase = createClientComponentClient()
    console.log('Supabase client created');

    // Fetch initial data only when session is available
    fetchDashboardData();
    console.log('Initial data fetch triggered');

    // Rest of the subscription setup...
    const tasksChannel = supabase.channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `created_by=eq.${session.user.id}`
        },
        async (payload) => {
          console.log('Task change detected:', payload);
          await fetchDashboardData();
          
          if (payload.eventType === 'INSERT') {
            console.log('New task inserted, showing notification');
            addNotification({
              message: 'New task created',
              description: payload.new.title,
              type: 'success',
              icon: <CheckSquare className="w-4 h-4" />
            });
          }
        }
      )

    const activitiesChannel = supabase.channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_activities',
          filter: `created_by=eq.${session.user.id}`
        },
        async (payload) => {
          console.log('Activity change detected:', payload);
          await fetchDashboardData();
          
          if (payload.eventType === 'INSERT') {
            addNotification({
              message: 'New activity scheduled',
              description: payload.new.title,
              type: 'info',
              icon: <Calendar className="w-4 h-4 text-blue-400" />
            });
          }
        }
      )

    const contactsChannel = supabase.channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `created_by=eq.${session.user.id}`
        },
        async (payload) => {
          console.log('Contact change detected:', payload);
          await fetchDashboardData();
          
          if (payload.eventType === 'INSERT') {
            addNotification({
              message: 'New contact added',
              description: `${payload.new.first_name} ${payload.new.last_name}`,
              type: 'success',
              icon: <Users className="w-4 h-4 text-pink-400" />
            });
          }
        }
      )

    // Subscribe to all channels
    Promise.all([
      tasksChannel.subscribe(),
      activitiesChannel.subscribe(),
      contactsChannel.subscribe()
    ]).then(() => {
      console.log('All channels subscribed successfully');
    }).catch((error) => {
      console.error('Error subscribing to channels:', error);
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [session?.user?.id, fetchDashboardData]); // Add fetchDashboardData to dependencies

  // Set up initial split view content
  useEffect(() => {
    const setupInitialContent = () => {
      const initialTopContent = (
        <motion.div 
          className="h-full bg-[#111111] rounded-t-2xl"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "tween",
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }
          }}
        >
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">Recent Updates</h2>
                <p className="text-zinc-400 mt-1">Latest activity in your CRM</p>
              </div>
            </div>
          </div>
        </motion.div>
      )

      const initialBottomContent = (
        <motion.div 
          className="h-full bg-[#111111] rounded-b-2xl"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "tween",
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }
          }}
        >
          <div className="p-8 border-t border-white/[0.03]">
            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <motion.div 
                    key={activity.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{activity.title}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activity.type === 'call' ? 'bg-emerald-500/20 text-emerald-400' :
                            activity.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                        {activity.contact && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-sm text-zinc-400">
                              <Users className="w-3 h-3" />
                              {activity.contact.first_name} {activity.contact.last_name}
                            </div>
                            {activity.contact.company && (
                              <div className="flex items-center gap-1 text-sm text-zinc-400">
                                <Building2 className="w-3 h-3" />
                                {activity.contact.company}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-zinc-500">{formatDate(activity.scheduled_for)}</p>
                          <div className="flex items-center gap-1">
                            {activity.type === 'call' && activity.contact?.phone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${activity.contact.phone}`;
                                }}
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                title="Call contact"
                              >
                                <Phone className="w-3 h-3" />
                              </button>
                            )}
                            {activity.type === 'email' && activity.contact?.email && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${activity.contact.email}`;
                                }}
                                className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                title="Send email"
                              >
                                <Mail className="w-3 h-3" />
                              </button>
                            )}
                            {activity.type === 'meeting' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open('https://meet.google.com/new', '_blank');
                                }}
                                className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                title="Start meeting"
                              >
                                <Video className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Calendar className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                <p className="text-zinc-400">Activities will appear here as you use the CRM</p>
              </div>
            )}
          </div>
        </motion.div>
      )

      setContentAndShow(initialTopContent, initialBottomContent, 'initial')
    }

    requestAnimationFrame(setupInitialContent)

    return () => {
      hide()
    }
  }, [])

  // Add contact loading function
  const handleActivityClick = useCallback(async (activity: any) => {
    try {
      // Get contact associated with this activity
      const { data: activityData, error: activityError } = await supabase
        .from('scheduled_activities')
        .select('*, contacts(*)')
        .eq('id', activity.id)
        .single();

      if (activityError) throw activityError;
      if (!activityData?.contacts) return;

      const contact = activityData.contacts;
      
      // Create action buttons based on activity type
      const actionButtons = (
        <div className="flex items-center gap-2 mt-4">
          {activity.type === 'call' && (
            <a 
              href={`tel:${contact.phone}`}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              title="Call"
            >
              <Phone className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
            </a>
          )}
          {activity.type === 'email' && (
            <a 
              href={`mailto:${contact.email}`}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              title="Send email"
            >
              <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
            </a>
          )}
          {activity.type === 'meeting' && (
            <a 
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              title="Start video call"
            >
              <Video className="w-5 h-5 text-purple-500 group-hover:text-purple-400" />
            </a>
          )}
        </div>
      );

      // Show contact details in third column
      setContentAndShow(
        <motion.div 
          className="h-full bg-[#111111] rounded-t-xl p-6"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ type: "tween", duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">{activity.title}</h2>
              <div className="flex items-center gap-2">
                <activity.icon className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400 capitalize">{activity.type}</span>
              </div>
            </div>
          </div>
          {actionButtons}
        </motion.div>,
        <motion.div 
          className="h-full bg-[#111111] rounded-b-xl p-6 border-t border-white/[0.08]"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "tween", duration: 0.4 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                {contact.first_name?.[0]}{contact.last_name?.[0]}
              </div>
              <div>
                <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {contact.company && (
                    <p className="text-sm text-zinc-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {contact.company}
                    </p>
                  )}
                  {contact.job_title && (
                    <p className="text-sm text-zinc-400">{contact.job_title}</p>
                  )}
                </div>
                {contact.scheduled_activities?.[0] && (
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last interaction: {formatDate(contact.scheduled_activities[0].created_at)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {contact.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Phone</div>
                    <div className="text-white">{contact.phone}</div>
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Email</div>
                    <div className="text-white">{contact.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>,
        `activity-${activity.id}`
      );
    } catch (error) {
      console.error('Error loading contact details:', error);
    }
  }, [supabase, setContentAndShow]);

  const handleDashboardTaskClick = useCallback((task: any) => {
    const topContent = (
      <motion.div 
        className="h-full bg-[#111111] rounded-t-xl p-6"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ type: "tween", duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">{task.title}</h2>
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-zinc-400" />
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {task.assigned_to && (
            <button 
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              title="Send email"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${task.assigned_to}`;
              }}
            >
              <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
            </button>
          )}
        </div>
      </motion.div>
    );

    const bottomContent = (
      <motion.div 
        className="h-full bg-[#111111] rounded-b-xl p-6 border-t border-white/[0.08]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "tween", duration: 0.4 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Task Details</h3>
              <p className="text-sm text-zinc-400">{task.description || 'No description provided'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-zinc-400">Due Date</div>
                <div className="text-white">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-zinc-400">Priority</div>
                <div className="text-white capitalize">{task.priority || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );

    setContentAndShow(topContent, bottomContent, `dashboard-task-${task.id}`);
  }, [setContentAndShow]);

  const handleTaskStatusUpdate = useCallback(async (taskId: string, newStatus: string) => {
    if (!session?.user?.id) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select('*')
        .single();

      if (error) throw error;

      // Log the status change activity
      await supabase
        .from('task_activities')
        .insert({
          task_id: taskId,
          action_type: 'status_change',
          previous_value: task.status,
          new_value: newStatus,
          created_by: session.user.id
        });

      // Update local state
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      // Show success notification
      addNotification({
        message: 'Task status updated',
        description: `Task "${task.title}" marked as ${newStatus}`,
        type: 'success',
        icon: <CheckSquare className="w-4 h-4" />
      });

    } catch (error) {
      console.error('Error updating task status:', error);
      addNotification({
        message: 'Failed to update task',
        description: 'There was an error updating the task status',
        type: 'error',
        icon: <XCircle className="w-4 h-4" />
      });
    }
  }, [session?.user?.id, tasks, supabase, addNotification]);

  return (
    <PageTransition>
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0, x: "100%" }}
        animate={isDataReady ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" }}
        transition={{
          duration: 1.2,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        <div className="p-8">
          {/* Replace Toaster with custom notifications */}
          <div className="fixed top-4 right-4 z-[9999] space-y-2">
            <AnimatePresence>
              {notifications.length > 0 && (
                <>
                  {console.log('Current notifications:', notifications)}
                  {notifications.map(notification => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-lg shadow-lg backdrop-blur-sm flex items-start gap-3 max-w-sm
                        ${notification.type === 'success' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-blue-500/20 border-2 border-blue-500'}`}
                    >
                      {notification.icon && (
                        <div className="mt-1">{notification.icon}</div>
                      )}
                      <div>
                        <div className="font-medium text-sm text-white">
                          {notification.message}
                        </div>
                        {notification.description && (
                          <div className="text-sm text-white/80 mt-1">
                            {notification.description}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Welcome Message */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={isDataReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ 
              duration: 0.3,
              delay: 0.2
            }}
          >
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-zinc-400 mt-2 text-lg">
              Here's what's happening in your CRM today
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial="hidden"
            animate={isDataReady ? "visible" : "hidden"}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.3
                }
              }
            }}
          >
            {metrics.map((metric) => (
              <motion.div
                key={metric.id}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 }
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1]
                }}
                className={`dashboard-card relative overflow-hidden rounded-xl p-6 bg-[#111111] border border-white/10 cursor-pointer ${metric.className}
                  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent before:pointer-events-none
                  after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/[0.06] after:to-transparent after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100`}
                onClick={() => handleMetricClick(metric)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-white/5">
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400">
                    {metric.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-400">
                    {metric.name}
                  </h3>
                  <div className="text-2xl font-bold">
                    {metric.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Two Column Layout */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial="hidden"
            animate={isDataReady ? "visible" : "hidden"}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4
                }
              }
            }}
          >
            {/* Tasks Overview */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
              transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="space-y-4"
            >
              <div className="bg-[#111111] rounded-2xl">
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                      <ListTodo className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">Recent Tasks</h2>
                      <p className="text-zinc-400 mt-1">Your latest tasks and to-dos</p>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {tasks.length > 0 ? tasks.slice(0, 15).map((task, index) => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] stagger-${index + 1} cursor-pointer hover:bg-white/[0.02] transition-colors`}
                        onClick={() => handleDashboardTaskClick(task)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{task.title}</h3>
                              {task.priority && (
                                <div 
                                  className={`w-2 h-2 rounded-full ${getPriorityIndicator(task.priority).color}`} 
                                  title={getPriorityIndicator(task.priority).label}
                                />
                              )}
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {new Date(task.updated_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {task.status}
                            </span>
                            {task.due_date && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getTaskDueStatus(task.due_date)?.class}`}>
                                {getTaskDueStatus(task.due_date)?.label}
                              </span>
                            )}
                          </div>
                          {task.status !== 'completed' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskStatusUpdate(task.id, 'completed');
                                }}
                                className="text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              >
                                Mark Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-zinc-500">
                        No tasks available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Activities */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
              transition={{
                duration: 0.5,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="space-y-4"
            >
              <div className="bg-[#111111] rounded-2xl">
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">Upcoming Activities</h2>
                      <p className="text-zinc-400 mt-1">Your scheduled meetings and calls</p>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {activities.length > 0 ? activities.map((activity, index) => (
                      <div 
                        key={activity.id} 
                        className={`p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] stagger-${index + 1} cursor-pointer hover:bg-white/[0.02] transition-colors`}
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{activity.title}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                activity.type === 'call' ? 'bg-emerald-500/20 text-emerald-400' :
                                activity.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {activity.type}
                              </span>
                            </div>
                            {activity.contact && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-sm text-zinc-400">
                                  <Users className="w-3 h-3" />
                                  {activity.contact.first_name} {activity.contact.last_name}
                                </div>
                                {activity.contact.company && (
                                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                                    <Building2 className="w-3 h-3" />
                                    {activity.contact.company}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-zinc-500">{formatDate(activity.scheduled_for)}</p>
                              <div className="flex items-center gap-1">
                                {activity.type === 'call' && activity.contact?.phone && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `tel:${activity.contact.phone}`;
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                    title="Call contact"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </button>
                                )}
                                {activity.type === 'email' && activity.contact?.email && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `mailto:${activity.contact.email}`;
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    title="Send email"
                                  >
                                    <Mail className="w-3 h-3" />
                                  </button>
                                )}
                                {activity.type === 'meeting' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open('https://meet.google.com/new', '_blank');
                                    }}
                                    className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                    title="Start meeting"
                                  >
                                    <Video className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-zinc-500">
                        No upcoming activities
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  )
}
