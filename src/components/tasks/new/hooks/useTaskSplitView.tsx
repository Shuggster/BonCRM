'use client'

import { useCallback } from 'react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { motion } from 'framer-motion'
import { BarChart3, CheckSquare, Clock } from 'lucide-react'
import type { Task } from '@/types/tasks'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#22c55e'
}

const STATUS_COLORS = {
  'todo': '#f97316',
  'in-progress': '#3b82f6',
  'completed': '#22c55e'
}

export function useTaskSplitView() {
  const { setContentAndShow, hide } = useSplitViewStore()

  const showTaskOverview = useCallback((tasks: Task[], isLoading: boolean) => {
    const dueTodayCount = tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      return dueDate.toDateString() === today.toDateString()
    }).length

    const completedCount = tasks.filter(task => task.status === 'completed').length

    // Calculate priority distribution for pie chart
    const priorityDistribution = ['high', 'medium', 'low'].map(priority => ({
      name: priority,
      value: tasks.filter(task => task.priority === priority).length
    }))

    // Calculate status distribution for bar chart
    const statusDistribution = ['todo', 'in-progress', 'completed'].map(status => ({
      name: status.replace('-', ' '),
      value: tasks.filter(task => task.status === status).length
    }))

    const topContent = (
      <div className="h-full bg-black">
        <motion.div 
          className="h-full"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}
          >
            <div className="relative z-10">
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">Task Overview</h2>
                    <p className="text-zinc-400 mt-1">Your task metrics and progress</p>
                  </div>
                </div>

                {/* Task Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <h3 className="text-sm font-medium text-zinc-400">Due Today</h3>
                    </div>
                    {isLoading ? (
                      <div className="mt-1 flex items-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{dueTodayCount}</div>
                        <div className="text-sm text-zinc-500">tasks</div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-green-400" />
                      <h3 className="text-sm font-medium text-zinc-400">Completed</h3>
                    </div>
                    {isLoading ? (
                      <div className="mt-1 flex items-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <div className="text-sm text-zinc-500">
                          {((completedCount / tasks.length) * 100).toFixed(0)}% of total
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                  {/* Priority Distribution */}
                  <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                    <h3 className="text-sm font-medium text-zinc-400 mb-6">Priority Distribution</h3>
                    <div className="aspect-square relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                          >
                            {priorityDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]}
                                strokeWidth={0}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="p-2 rounded-lg bg-[#111111] border border-white/[0.1] backdrop-blur-xl">
                                    <p className="text-sm font-medium capitalize">{data.name}</p>
                                    <p className="text-xs text-zinc-400 mt-1">
                                      {data.value} tasks ({((data.value / tasks.length) * 100).toFixed(0)}%)
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {priorityDistribution.find(d => d.name === 'high')?.value || 0}
                          </div>
                          <div className="text-xs text-zinc-400">High Priority</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      {priorityDistribution.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] }}
                          />
                          <span className="text-xs text-zinc-400 capitalize">
                            {entry.name} ({((entry.value / tasks.length) * 100).toFixed(0)}%)
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
                        <BarChart data={statusDistribution}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="p-2 rounded-lg bg-[#111111] border border-white/[0.1] backdrop-blur-xl">
                                    <p className="text-sm font-medium capitalize">{data.name}</p>
                                    <p className="text-xs text-zinc-400 mt-1">
                                      {data.value} tasks ({((data.value / tasks.length) * 100).toFixed(0)}%)
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[4, 4, 0, 0]}
                            minPointSize={2}
                            maxBarSize={40}
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.name.replace(' ', '-') as keyof typeof STATUS_COLORS]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      {statusDistribution.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: STATUS_COLORS[entry.name.replace(' ', '-') as keyof typeof STATUS_COLORS] }}
                          />
                          <span className="text-xs text-zinc-400 capitalize">
                            {entry.name} ({((entry.value / tasks.length) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )

    const bottomContent = (
      <div className="h-full bg-[#111111]">
        <motion.div 
          className="h-full"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}
          >
            <div className="relative z-10">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Recent Tasks</h3>
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]"
                    >
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-zinc-400 text-center">
                      No tasks yet. Click "Create Task" to add one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )

    setContentAndShow(topContent, bottomContent, 'task-overview')
  }, [setContentAndShow])

  return {
    showTaskOverview,
    hide
  }
} 