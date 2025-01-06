'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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

interface TaskViewContextType {
  selectedTask: Task | null
  isLoading: boolean
  error: string | null
  selectTask: (taskId: string) => Promise<void>
  clearSelection: () => void
}

const TaskViewContext = createContext<TaskViewContextType | undefined>(undefined)

export function TaskViewProvider({ children }: { children: React.ReactNode }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const selectTask = async (taskId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_group:task_groups(name, color),
          assigned_user:users(name, email)
        `)
        .eq('id', taskId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Task not found')

      setSelectedTask(data)
    } catch (err: any) {
      setError(err.message)
      setSelectedTask(null)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedTask(null)
    setError(null)
  }

  return (
    <TaskViewContext.Provider
      value={{
        selectedTask,
        isLoading,
        error,
        selectTask,
        clearSelection
      }}
    >
      {children}
    </TaskViewContext.Provider>
  )
}

export function useTaskView() {
  const context = useContext(TaskViewContext)
  if (!context) {
    throw new Error('useTaskView must be used within a TaskViewProvider')
  }
  return context
} 