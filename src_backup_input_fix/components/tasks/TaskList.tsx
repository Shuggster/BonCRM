'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  task_group_id: string | null
  status: 'todo' | 'in-progress' | 'completed'
  assigned_to: string | null
  task_group?: {
    name: string
    color: string
  }
  assigned_user?: {
    name: string
    email: string
  }
}

interface TaskListProps {
  onTaskSelect: (taskId: string) => void
  onAddClick: () => void
}

export function TaskList({ onTaskSelect, onAddClick }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    if (status === 'authenticated') {
      fetchTasks()
    }
  }, [session?.user?.id, status])

  const fetchTasks = async () => {
    if (!session?.user?.id) {
      console.log('No user ID found in session')
      return
    }

    console.log('Fetching tasks for user:', session.user.id)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_group:task_groups(name, color),
          assigned_user:users(name, email)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error from Supabase:', error)
        throw error
      }

      console.log('Fetched tasks:', data)
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    onTaskSelect(taskId)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Tasks</h1>
          <Button
            onClick={onAddClick}
            size="sm"
            className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-9 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 text-white/60">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-4 text-white/60">No tasks found</div>
        ) : (
          <div className="divide-y divide-white/10">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-white/5 transition-colors",
                  selectedTaskId === task.id && "bg-white/5"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      task.priority === 'high' && "bg-red-500/10 text-red-500",
                      task.priority === 'medium' && "bg-yellow-500/10 text-yellow-500",
                      task.priority === 'low' && "bg-green-500/10 text-green-500"
                    )}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    {task.task_group && (
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: task.task_group.color }}
                        />
                        {task.task_group.name}
                      </div>
                    )}
                    
                    <div className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                      task.status === 'completed' && "bg-green-500/10 text-green-500",
                      task.status === 'in-progress' && "bg-blue-500/10 text-blue-500",
                      task.status === 'todo' && "bg-white/10 text-white/90"
                    )}>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'Completed'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
} 