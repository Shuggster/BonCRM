"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckSquare, Target, BarChart3, MessageSquare, Calendar, Phone, Mail, Video, ArrowRight, ListTodo } from 'lucide-react'
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
  type: 'success' | 'info';
  icon?: React.ReactNode;
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetric[]>(defaultMetrics)
  const [tasks, setTasks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const { setContent, show, hide } = useSplitViewStore()
  const supabase = createClientComponentClient()
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetric | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMetricClick, setPendingMetricClick] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isDataReady, setIsDataReady] = useState(false)

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

  const handleMetricClick = useCallback((metric: DashboardMetric) => {
    hide();
    setSelectedMetric(metric);
    
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
                  {activities.map((activity, index) => (
                    <motion.div 
                      key={activity.id} 
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-pink-400 activity-dot" />
                        <h3 className="font-medium flex-1">{activity.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-zinc-400">Added {formatDate(activity.scheduled_for)}</span>
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
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">completed</span>
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
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">in progress</span>
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
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                          <activity.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-zinc-400 mt-0.5">{activity.type}</p>
                          <p className="text-xs text-zinc-500 mt-1">{formatDate(activity.scheduled_for)}</p>
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

      setContent(topContent, bottomContent);
      show();
    }, 100); // Small delay for animation
  }, [hide, show, setContent, activities, tasks, formatDate]);

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
      console.log('Fetching dashboard data...');
      setIsLoading(true)
      
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('scheduled_activities')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (contactsError) throw contactsError;
      if (tasksError) throw tasksError;
      if (activitiesError) throw activitiesError;

      // Update all the data
      setTasks(tasksData?.slice(0, 3) || []);
      setActivities(activitiesData?.slice(0, 3).map(activity => {
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
          icon
        };
      }) || []);

      // Update metrics last
      setMetrics(prev => prev.map(metric => {
        if (metric.name === "Total Contacts") {
          return {
            ...metric,
            value: contactsData?.length.toString() || '0',
            change: '+0 this week'
          };
        }
        if (metric.name === "Tasks Completed") {
          const total = tasksData?.length || 0;
          const completed = tasksData?.filter(t => t.status === 'completed').length || 0;
          return {
            ...metric,
            value: `${completed}/${total}`,
            change: `${Math.round((completed / total) * 100)}%`
          };
        }
        if (metric.name === "Active Tasks") {
          return {
            ...metric,
            value: tasksData?.filter(t => t.status === 'in-progress').length.toString() || '0',
            change: `${tasksData?.filter(t => t.status === 'todo').length || 0} pending`
          };
        }
        if (metric.name === "Scheduled Activities") {
          return {
            ...metric,
            value: (activitiesData?.length || 0).toString(),
            change: 'upcoming'
          };
        }
        return metric;
      }));

      setIsLoading(false)
      // Only set data ready after everything is updated
      setIsDataReady(true)
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false)
      setIsDataReady(true) // Still set ready to show error states
    }
  }, [supabase]);

  // Update subscription handlers
  useEffect(() => {
    console.log('Setting up subscriptions - START');
    
    if (!session?.user?.id) {
      console.log('No user session, skipping subscriptions');
      return;
    }

    const supabase = createClientComponentClient()
    console.log('Supabase client created');

    // Fetch initial data
    fetchDashboardData();
    console.log('Initial data fetch triggered');

    // Set up task subscription
    const tasksChannel = supabase.channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${session.user.id}`
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

    // Set up activities subscription
    const activitiesChannel = supabase.channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_activities',
          filter: `user_id=eq.${session.user.id}`
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

    // Set up contacts subscription
    const contactsChannel = supabase.channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${session.user.id}`
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
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-zinc-400 mt-0.5">{activity.type}</p>
                        <p className="text-xs text-zinc-500 mt-1">{formatDate(activity.scheduled_for)}</p>
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

      setContent(initialTopContent, initialBottomContent)
      show()
    }

    requestAnimationFrame(setupInitialContent)

    return () => {
      hide()
    }
  }, [])

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
                    {tasks.length > 0 ? tasks.map((task, index) => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] stagger-${index + 1}`}
                      >
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {task.status}
                          </span>
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
                        className={`p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] stagger-${index + 1}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                            {activity.type === 'call' && <Phone className="w-5 h-5" />}
                            {activity.type === 'email' && <Mail className="w-5 h-5" />}
                            {activity.type === 'meeting' && <Video className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{activity.title}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{activity.description}</p>
                            <p className="text-xs text-zinc-500 mt-2">{formatDate(activity.scheduled_for)}</p>
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
