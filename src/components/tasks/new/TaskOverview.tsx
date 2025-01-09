'use client'

import { motion } from 'framer-motion'
import { BarChart2, Clock, CheckCircle2, ArrowRight, Plus, Filter, LayoutGrid } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { Task } from '@/types/tasks'
import { PRIORITY_COLORS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

interface TaskOverviewProps {
  tasks: Task[]
  section?: 'upper' | 'lower'
  onViewDueToday: () => void
  onViewCompleted: () => void
  onCreateTask?: () => void
  onViewAll?: () => void
  onFilter?: () => void
}

export function TaskOverview({ 
  tasks, 
  section = 'upper', 
  onViewDueToday, 
  onViewCompleted,
  onCreateTask,
  onViewAll,
  onFilter
}: TaskOverviewProps) {
  console.log('TaskOverview received tasks:', tasks)

  // Calculate metrics
  const dueToday = tasks.filter(task => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  }).length

  const completed = tasks.filter(t => t.status === 'completed').length
  console.log('Completed tasks count:', completed)

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
  console.log('Priority data:', priorityData)

  // Calculate completion data for the last 7 days
  const completionData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const completed = tasks.filter(task => {
      if (task.status !== 'completed') return false
      const taskDate = new Date(task.updated_at)
      return taskDate.toDateString() === date.toDateString()
    }).length

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed
    }
  }).reverse()
  console.log('Completion data:', completionData)

  // Upper section content
  if (section === 'upper') {
    return (
      <div className="rounded-t-2xl bg-[#111111] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Task Overview</h2>
            <p className="text-zinc-400 mt-1">Your task metrics and progress</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={onViewDueToday}
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
            onClick={onViewCompleted}
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
        </div>

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
      </div>
    )
  }

  // Lower section content
  return (
    <div className="rounded-b-2xl bg-[#111111] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-zinc-400">Task Completion History</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-zinc-400 hover:text-white"
            onClick={onCreateTask}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Task
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-zinc-400 hover:text-white"
            onClick={onFilter}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-zinc-400 hover:text-white"
            onClick={onViewAll}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            View All
          </Button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={completionData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="day" 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              dx={-10}
              domain={[0, 'auto']}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              formatter={(value) => [`${value} tasks`, 'Completed']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="completed" 
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              minPointSize={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Tasks */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400">Recent Tasks</h3>
          {tasks.length > 0 && (
            <span className="text-xs text-zinc-500">{tasks.length} total tasks</span>
          )}
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div 
              key={task.id}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 