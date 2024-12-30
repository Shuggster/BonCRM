'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2, BarChart2, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import { Task } from '@/types/tasks'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { TaskView } from './TaskView'

interface TaskOverviewProps {
  tasks: Task[]
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
}

export function TaskOverview({ tasks, onViewTask, onEditTask }: TaskOverviewProps) {
  const { setContent, show, hide } = useSplitViewStore()

  // Calculate metrics
  const dueToday = tasks.filter(task => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  }).length

  const completed = tasks.filter(t => t.status === 'completed').length

  // Calculate priority distribution
  const priorityData = ['high', 'medium', 'low'].map(priority => {
    const count = tasks.filter(t => t.priority === priority).length
    const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    return {
      name: priority,
      value: count,
      percentage,
      fill: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
    }
  })

  // Calculate status distribution
  const statusData = ['todo', 'in-progress', 'completed'].map(status => {
    const count = tasks.filter(t => t.status === status).length
    const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    return {
      name: status,
      value: count,
      percentage,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    }
  })

  const handleViewDueToday = () => {
    hide()
    const dueTodayTasks = tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      return dueDate.toDateString() === today.toDateString()
    })

    setTimeout(() => {
      const content = (
        <div className="h-full bg-black">
          <motion.div 
            className="h-full"
            initial={{ y: 0 }}
            animate={{ 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 15
              }
            }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Tasks Due Today</h2>
              <div className="space-y-2">
                {dueTodayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    onClick={() => onViewTask(task)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] }}
                        />
                        <span>{task.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )

      setContent(content, null)
      show()
    }, 100)
  }

  const handleViewCompleted = () => {
    hide()
    const completedTasks = tasks.filter(t => t.status === 'completed')

    setTimeout(() => {
      const content = (
        <div className="h-full bg-black">
          <motion.div 
            className="h-full"
            initial={{ y: 0 }}
            animate={{ 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 15
              }
            }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Completed Tasks</h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    onClick={() => onViewTask(task)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] }}
                        />
                        <span>{task.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )

      setContent(content, null)
      show()
    }, 100)
  }

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
                <h2 className="text-2xl font-semibold">Task Overview</h2>
                <p className="text-zinc-400 mt-1">Your task metrics and progress</p>
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
              className="grid grid-cols-2 gap-4"
            >
              <div 
                onClick={handleViewDueToday}
                className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-zinc-400">Due Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dueToday}</div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div 
                onClick={handleViewCompleted}
                className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-zinc-400">Completed</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{completed}</div>
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
              {/* Priority Distribution */}
              <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                <h3 className="text-sm font-medium text-zinc-400 mb-6">Priority Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4">
                  {priorityData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs text-zinc-400 capitalize">
                        {entry.name} ({entry.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                <h3 className="text-sm font-medium text-zinc-400 mb-6">Status Distribution</h3>
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
                      <span className="text-xs text-zinc-400 capitalize">
                        {entry.name.replace('-', ' ')} ({entry.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Tasks */}
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
                <h3 className="text-sm font-medium text-zinc-400">Recent Tasks</h3>
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
                {tasks.slice(0, 5).map((task, index) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        delay: 0.6 + (index * 0.1),
                        duration: 0.3
                      }
                    }}
                    onClick={() => onViewTask(task)}
                    className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] flex items-center justify-between hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] 
                        }}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 capitalize">{task.status.replace('-', ' ')}</span>
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