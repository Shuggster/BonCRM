'use client'

import { useMemo } from 'react'
import { Building2, Plus, CalendarDays, ArrowRight, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { CalendarEvent } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import { format, startOfHour, addHours } from 'date-fns'
import { motion } from 'framer-motion'

// Split view animation
const splitViewConfig = {
  initial: { y: "50%" },
  animate: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  }
}

interface CalendarOverviewLowerCardProps {
  events: CalendarEvent[]
  onCreateEvent?: () => void
  onViewUpcoming?: () => void
  onJumpToday?: () => void
}

export function CalendarOverviewLowerCard({ 
  events,
  onCreateEvent,
  onViewUpcoming,
  onJumpToday
}: CalendarOverviewLowerCardProps) {
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

  // Calculate category distribution
  const categoryData = useMemo(() => {
    const distribution = events.reduce((acc: { [key: string]: number }, event) => {
      const category = event.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Convert to chart data and sort by count
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`
      }))
      .sort((a, b) => b.value - a.value)
  }, [events])

  // Calculate time distribution (events per hour)
  const timeData = useMemo(() => {
    const hourCounts = new Array(24).fill(0)
    
    events.forEach(event => {
      const hour = new Date(event.start).getHours()
      hourCounts[hour]++
    })

    return hourCounts.map((count, hour) => ({
      name: format(new Date().setHours(hour, 0, 0, 0), 'ha'),
      hour,
      value: count,
      fill: '#3b82f6'
    }))
  }, [events])

  return (
    <motion.div 
      variants={splitViewConfig}
      initial="initial"
      animate="animate"
      className="rounded-b-2xl bg-[#111111] border-t border-white/[0.08] p-6 space-y-6"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={onCreateEvent}
          className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Button>

        <Button
          onClick={onJumpToday}
          variant="outline"
          className="text-white/70 border-white/10 hover:bg-white/5"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Jump to Today
        </Button>

        <Button
          onClick={onViewUpcoming}
          variant="outline"
          className="text-white/70 border-white/10 hover:bg-white/5"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          View Upcoming
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-white">Event Categories</h3>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 80 }}
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
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Distribution */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-white">Time Distribution</h3>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeData}
                margin={{ top: 0, right: 0, bottom: 20, left: 0 }}
              >
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  interval={2}
                />
                <YAxis 
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
                  formatter={(value: number, name: string) => [`${value} events`, name]}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 