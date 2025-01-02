'use client'

import { useMemo } from 'react'
import { CalendarDays, Calendar, Clock, Users } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { CalendarEvent } from '@/types/calendar'
import { isToday, isFuture, isPast, isThisWeek } from 'date-fns'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { Button } from '@/components/ui/button'
import { PRIORITY_COLORS } from '@/lib/constants'
import { motion } from 'framer-motion'

// Split view animation
const splitViewConfig = {
  initial: { y: "-50%" },
  animate: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  }
}

interface CalendarOverviewUpperCardProps {
  events: CalendarEvent[]
  onViewEvents?: (events: CalendarEvent[], title: string) => void
}

export function CalendarOverviewUpperCard({ events, onViewEvents }: CalendarOverviewUpperCardProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const todayEvents = events.filter(event => isToday(new Date(event.start)))
    const weekEvents = events.filter(event => isThisWeek(new Date(event.start)))
    const upcomingEvents = events.filter(event => isFuture(new Date(event.start)))
    const totalEvents = events

    return {
      todayEvents,
      weekEvents,
      upcomingEvents,
      totalEvents
    }
  }, [events])

  // Status distribution data for pie chart
  const statusData = useMemo(() => {
    const today = events.filter(event => isToday(new Date(event.start))).length
    const upcoming = events.filter(event => isFuture(new Date(event.start))).length
    const past = events.filter(event => isPast(new Date(event.end))).length

    return [
      { name: 'Today', value: today, color: '#22c55e' },
      { name: 'Upcoming', value: upcoming, color: '#3b82f6' },
      { name: 'Past', value: past, color: '#6b7280' }
    ]
  }, [events])

  // Priority distribution data
  const priorityData = useMemo(() => {
    const distribution = events.reduce((acc: { [key: string]: number }, event) => {
      const priority = event.priority || 'medium' // Default to medium if not set
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // Convert to chart data and ensure all priorities are represented
    return ['high', 'medium', 'low'].map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: distribution[priority] || 0,
      fill: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
    }))
  }, [events])

  // Handle metric card clicks
  const handleMetricClick = (events: CalendarEvent[], title: string) => {
    if (onViewEvents) {
      onViewEvents(events, title)
    }
  }

  // Common tooltip style
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#111111',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '8px 12px'
    },
    itemStyle: { 
      color: '#ffffff',
      padding: '4px 0'
    },
    labelStyle: { 
      color: '#71717a',
      marginBottom: '4px'
    },
    wrapperStyle: {
      outline: 'none'
    }
  }

  return (
    <motion.div 
      variants={splitViewConfig}
      initial="initial"
      animate="animate"
      className="rounded-t-2xl bg-[#111111] p-6 space-y-6"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() => handleMetricClick(metrics.todayEvents, "Today's Events")}
        >
          <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10 hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm text-zinc-400">Today's Events</div>
              <div className="text-xl font-semibold text-white">{metrics.todayEvents.length}</div>
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() => handleMetricClick(metrics.weekEvents, "This Week's Events")}
        >
          <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10 hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-zinc-400">This Week</div>
              <div className="text-xl font-semibold text-white">{metrics.weekEvents.length}</div>
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() => handleMetricClick(metrics.upcomingEvents, "Upcoming Events")}
        >
          <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10 hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-sm text-zinc-400">Upcoming</div>
              <div className="text-xl font-semibold text-white">{metrics.upcomingEvents.length}</div>
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() => handleMetricClick(metrics.totalEvents, "All Events")}
        >
          <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10 hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-zinc-400">Total Events</div>
              <div className="text-xl font-semibold text-white">{metrics.totalEvents.length}</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Distribution</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipStyle.contentStyle}
                  itemStyle={tooltipStyle.itemStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  wrapperStyle={tooltipStyle.wrapperStyle}
                  formatter={(value: number, name: string) => [`${value} events`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-zinc-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Priority Distribution</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 60 }}
              >
                <XAxis 
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  itemStyle={tooltipStyle.itemStyle}
                  labelStyle={tooltipStyle.labelStyle}
                  wrapperStyle={tooltipStyle.wrapperStyle}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  formatter={(value: number) => [`${value} events`]}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 