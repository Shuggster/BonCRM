'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, CheckCircle2, BarChart2, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import { CalendarEvent } from '@/types/calendar'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { format, isToday, isFuture, isPast } from 'date-fns'

interface CalendarOverviewProps {
  events: CalendarEvent[]
  onViewEvent: (event: CalendarEvent) => void
}

const EVENT_STATUS_COLORS = {
  upcoming: '#3b82f6',  // blue
  today: '#f97316',     // orange
  past: '#71717a'       // gray
}

export function CalendarOverview({ events, onViewEvent }: CalendarOverviewProps) {
  const { hide } = useSplitViewStore()

  // Calculate metrics
  const todayEvents = events.filter(event => isToday(event.start)).length
  const upcomingEvents = events.filter(event => isFuture(event.start)).length
  const pastEvents = events.filter(event => isPast(event.end)).length

  // Calculate event distribution by department
  const departmentData = events.reduce((acc: { [key: string]: number }, event) => {
    if (event.department) {
      acc[event.department] = (acc[event.department] || 0) + 1
    }
    return acc
  }, {})

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }))

  // Calculate event status distribution
  const statusData = [
    { name: 'Today', value: todayEvents, fill: EVENT_STATUS_COLORS.today },
    { name: 'Upcoming', value: upcomingEvents, fill: EVENT_STATUS_COLORS.upcoming },
    { name: 'Past', value: pastEvents, fill: EVENT_STATUS_COLORS.past }
  ]

  return (
    <motion.div 
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 50,
          damping: 15
        }
      }}
    >
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-[16px]" 
        style={{ 
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
        }}
      >
        <div className="relative z-10">
          <div className="p-6 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.2,
                  duration: 0.5
                }
              }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                <BarChart2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Calendar Overview</h2>
                <p className="text-zinc-400 mt-1">Your event metrics and schedule</p>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.5
                }
              }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-zinc-400">Today's Events</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{todayEvents}</div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-zinc-400">Upcoming Events</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{upcomingEvents}</div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">Past Events</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{pastEvents}</div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            {/* Charts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.4,
                  duration: 0.5
                }
              }}
              className="grid grid-cols-2 gap-6"
            >
              {/* Department Distribution */}
              <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                <h3 className="text-sm font-medium text-zinc-400 mb-6">Department Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {departmentChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs text-zinc-400 capitalize">
                        {entry.name} ({Math.round((entry.value / events.length) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                <h3 className="text-sm font-medium text-zinc-400 mb-6">Event Status</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical">
                      <XAxis type="number" hide />
                      <Bar dataKey="value" barSize={24}>
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            radius={4}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs text-zinc-400">
                        {entry.name} ({Math.round((entry.value / events.length) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Events */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.5,
                  duration: 0.5
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-zinc-400">Recent Events</h3>
                <Button 
                  variant="ghost" 
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() => hide()}
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-2">
                {events.slice(0, 5).map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        delay: 0.6 + (index * 0.1),
                        duration: 0.3
                      }
                    }}
                    onClick={() => onViewEvent(event)}
                    className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] flex items-center justify-between hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: isToday(event.start) 
                            ? EVENT_STATUS_COLORS.today 
                            : isFuture(event.start)
                            ? EVENT_STATUS_COLORS.upcoming
                            : EVENT_STATUS_COLORS.past
                        }}
                      />
                      <span className="text-sm">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{format(event.start, 'MMM d, h:mm a')}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 