"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'
import { Tasks } from '@/components/tasks/new/Tasks'
import { motion } from 'framer-motion'
import { BarChart3, CheckSquare, Clock } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { Task } from '@/types/tasks'

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

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { data: session } = useSession()
  const { setContent, show, hide } = useSplitViewStore()

  // Set up initial split view content
  useEffect(() => {
    const setupInitialContent = () => {
      // Calculate task metrics
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
        <div className="h-full bg-[#111111]">
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
                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-medium text-zinc-400">Due Today</h3>
                      </div>
                      {isLoading ? (
                        <div className="mt-1 flex items-center">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="mt-1 text-2xl font-bold">{dueTodayCount}</div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-medium text-zinc-400">Completed</h3>
                      </div>
                      {isLoading ? (
                        <div className="mt-1 flex items-center">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="mt-1 text-2xl font-bold">{completedCount}</div>
                      )}
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {/* Priority Distribution */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-4">Priority Distribution</h3>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={priorityDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={false}
                            >
                              {priorityDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="p-2 rounded-lg bg-black/90 border border-white/[0.1] backdrop-blur-xl">
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
                      )}
                      <div className="flex justify-center gap-4 mt-4">
                        {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                          <div key={priority} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-zinc-400 capitalize">{priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Distribution</h3>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={statusDistribution}>
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="p-2 rounded-lg bg-black/90 border border-white/[0.1] backdrop-blur-xl">
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
                              label={{
                                position: 'top',
                                content: (props: any) => {
                                  const value = typeof props.value === 'number' ? props.value : 0;
                                  return value > 0 ? value : null;
                                },
                                fill: '#71717a',
                                fontSize: 12
                              }}
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
                      )}
                      <div className="flex justify-center gap-4 mt-4">
                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                          <div key={status} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-zinc-400 capitalize">{status.replace('-', ' ')}</span>
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

      setContent(topContent, bottomContent)
      show()
    }

    // Use requestAnimationFrame to ensure DOM is ready
    if (!isLoading) {
      requestAnimationFrame(setupInitialContent)
    }

    return () => {
      hide()
    }
  }, [isLoading, tasks])

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setTasks(data)
      }
      setIsLoading(false)
    }

    fetchTasks()
  }, [session?.user?.id])

  const handleCreateTask = async (data: any) => {
    if (!session?.user?.id) return

    try {
      const { data: createdTask, error } = await supabase
        .from('tasks')
        .insert([{
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: 'todo',
          due_date: data.dueDate,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      if (createdTask) {
        // Add new task to the beginning of the list
        setTasks(prev => [createdTask, ...prev])
        return createdTask
      }
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (task: Task) => {
    if (!session?.user?.id) return

    try {
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        throw error
      }

      if (updatedTask) {
        // Update the task in the list
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
        return updatedTask
      }
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  return (
    <Tasks
      tasks={tasks}
      isLoading={isLoading}
      onCreateTask={handleCreateTask}
      onUpdateTask={handleUpdateTask}
    />
  )
} 