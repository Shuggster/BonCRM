'use client'

import { useState, useEffect } from 'react'
import { Tasks } from '@/components/tasks/new/Tasks'
import { TaskView } from '@/components/tasks/new/TaskView'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'
import type { Task } from '@/types/tasks'
import { motion } from 'framer-motion'
import PageTransition from '@/components/animations/PageTransition'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { BarChart3, CheckSquare, Clock, ArrowUpRight, ArrowRight, Plus, Filter, LayoutGrid } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { SimpleTaskForm } from '@/components/tasks/new/SimpleTaskForm'
import type { TaskFormData } from '@/components/tasks/new/TaskFormContext'
import { TaskFormProvider } from '@/components/tasks/new/TaskFormContext'

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const supabase = createClientComponentClient()
  const { data: session } = useSession()
  const { setContent, show, hide } = useSplitViewStore()
  const router = useRouter()

  const setupInitialContent = () => {
    // Calculate task metrics
    const dueTodayCount = tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      return dueDate.toDateString() === today.toDateString()
    }).length

    const completedCount = tasks.filter(task => task.status === 'completed').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? ((completedCount / totalTasks) * 100).toFixed(1) : '0'

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
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.05] flex items-center justify-center">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Task Overview</h2>
                      <p className="text-zinc-400 mt-1">Your task metrics and progress</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
                      onClick={() => handleCreateClick?.()}
                    >
                      <Plus className="w-4 h-4" />
                      Create Task
                    </Button>
                  </div>
                </div>

                {/* Task Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div 
                    onClick={() => {
                      const dueTodayTasks = tasks.filter(task => {
                        if (!task.due_date) return false;
                        const dueDate = new Date(task.due_date);
                        const today = new Date();
                        return dueDate.toDateString() === today.toDateString();
                      });

                      hide();
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewTask(task);
                                      }}
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
                                  {dueTodayTasks.length === 0 && (
                                    <div className="text-zinc-400 text-center py-8">
                                      No tasks due today.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                        setContent(content, null, 'due-today');
                        show();
                      }, 100);
                    }}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                  >
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
                        <div className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors">
                          View tasks
                          <ArrowRight className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div 
                    onClick={() => {
                      const completedTasks = tasks.filter(task => task.status === 'completed');

                      hide();
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewTask(task);
                                      }}
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
                                  {completedTasks.length === 0 && (
                                    <div className="text-zinc-400 text-center py-8">
                                      No completed tasks.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                        setContent(content, null, 'completed');
                        show();
                      }, 100);
                    }}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                  >
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
                        <div className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors">
                          View completed
                          <ArrowRight className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div 
                    onClick={() => {
                      hide();
                      setTimeout(() => {
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
                                    <h2 className="text-2xl font-semibold mb-6">Task Progress</h2>
                                    <div className="space-y-6">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="text-sm text-zinc-400">Completion Rate</div>
                                          <div className="text-2xl font-bold mt-1">{completionRate}%</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-zinc-400">Total Tasks</div>
                                          <div className="text-2xl font-bold mt-1">{tasks.length}</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-zinc-400">Completed</div>
                                          <div className="text-2xl font-bold mt-1">{completedCount}</div>
                                        </div>
                                      </div>
                                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div 
                                          className="h-full bg-blue-500 rounded-full"
                                          initial={{ width: 0 }}
                                          animate={{ 
                                            width: `${completionRate}%`,
                                            transition: {
                                              duration: 0.8,
                                              ease: "easeOut"
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );

                        const bottomContent = (
                          <div className="h-full bg-black">
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
                                    <h3 className="text-lg font-medium mb-6">Task Distribution</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                                        <div className="text-sm text-zinc-400 mb-2">By Priority</div>
                                        <div className="space-y-2">
                                          {Object.entries(PRIORITY_COLORS).map(([priority, color]) => {
                                            const count = tasks.filter(t => t.priority === priority).length;
                                            const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                                            return (
                                              <div key={priority} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                  <span className="text-sm capitalize">{priority}</span>
                                                </div>
                                                <span className="text-sm text-zinc-400">{count} ({percentage.toFixed(0)}%)</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                                        <div className="text-sm text-zinc-400 mb-2">By Status</div>
                                        <div className="space-y-2">
                                          {Object.entries(STATUS_COLORS).map(([status, color]) => {
                                            const count = tasks.filter(t => t.status === status).length;
                                            const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                                            return (
                                              <div key={status} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                  <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                                                </div>
                                                <span className="text-sm text-zinc-400">{count} ({percentage.toFixed(0)}%)</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );

                        setContent(topContent, bottomContent, 'progress');
                        show();
                      }, 100);
                    }}
                    className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-medium text-zinc-400">Completion Rate</h3>
                    </div>
                    {isLoading ? (
                      <div className="mt-1 flex items-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{completionRate}%</div>
                        <div className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors">
                          Overall progress
                          <ArrowRight className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {/* Priority Distribution */}
                  <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                    <h3 className="text-sm font-medium text-zinc-400 mb-6">Priority Distribution</h3>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart margin={{ top: 30, right: 50, bottom: 30, left: 50 }}>
                          <Pie
                            data={priorityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value, percent }) => {
                              const percentage = (percent * 100).toFixed(0);
                              return `${value} (${percentage}%)`;
                            }}
                            labelLine={{ stroke: '#71717a', strokeWidth: 1, strokeDasharray: "2 2" }}
                            style={{ outline: 'none' }}
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
                    )}
                    <div className="flex justify-center gap-4 mt-4">
                      {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                        <div key={priority} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs text-zinc-400 capitalize">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                    <h3 className="text-sm font-medium text-zinc-400 mb-6">Status Distribution</h3>
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
                        <div key={status} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
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
      <div className="h-full bg-black">
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Recent Tasks</h3>
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
                  {tasks.slice(0, 5).map((task) => (
                    <motion.div
                      key={task.id}
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      onClick={() => handleViewTask(task)}
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
            </div>
          </div>
        </motion.div>
      </div>
    )

    setContent(topContent, bottomContent)
    show()
  }

  // Set up initial split view content
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      setupInitialContent()
    }
  }, [isLoading, tasks])

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
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
          task_group_id: data.task_group_id,
          assigned_to: data.assigned_to,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
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
          status: task.status,
          due_date: task.due_date,
          task_group_id: task.task_group_id,
          assigned_to: task.assigned_to,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
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

  const handleDeleteTask = async (taskId: string) => {
    if (!session?.user?.id) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }

      // Remove the task from the list
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const handleViewTask = (task: Task) => {
    hide();
    setTimeout(() => {
      const topContent = (
        <TaskView 
          task={task}
          section="upper"
          onClose={() => {
            hide();
            setSelectedTask(null);
          }}
          onEdit={handleEditTask}
        />
      );

      const bottomContent = (
        <TaskView 
          task={task}
          section="lower"
          onClose={() => {
            hide();
            setSelectedTask(null);
          }}
        />
      );

      setContent(topContent, bottomContent, task.id);
      show();
    }, 100);
  };

  return (
    <PageTransition>
      <Tasks
        tasks={tasks}
        isLoading={isLoading}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        currentUserId={session?.user?.id || ''}
        onViewTask={handleViewTask}
        onEditTask={handleViewTask}
        setupInitialContent={setupInitialContent}
      />
    </PageTransition>
  )
}
