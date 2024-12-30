'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface TaskGroup {
  id: string
  name: string
  color: string
  description?: string | null
}

export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  task_group_id: string | null
  status: 'todo' | 'in-progress' | 'completed'
  assigned_to: string | null
}

export interface User {
  id: string
  email: string
  name?: string
}

interface TaskFormContextType {
  formData: TaskFormData
  taskGroups: TaskGroup[]
  users: User[]
  updateField: (field: keyof TaskFormData, value: any) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  isFormActive: boolean
  createTaskGroup: (name: string, color: string) => Promise<TaskGroup>
  resetForm: () => void
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: null,
  task_group_id: null,
  status: 'todo',
  assigned_to: null
}

const TaskFormContext = createContext<TaskFormContextType | undefined>(undefined)

interface TaskFormProviderProps {
  children: React.ReactNode
  onSubmit: (data: TaskFormData) => Promise<void>
  initialData?: Partial<TaskFormData>
  onClose: () => void
}

export function TaskFormProvider({ children, onSubmit, initialData, onClose }: TaskFormProviderProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    ...initialFormData,
    ...initialData
  })
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormActive, setIsFormActive] = useState(true)
  const supabase = createClientComponentClient()

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
  }, [])

  useEffect(() => {
    console.log('TaskFormProvider mounted')
    if (!initialData?.title) {
      resetForm()
    }
    fetchTaskGroups()
    fetchUsers()
  }, [resetForm, initialData?.title])

  useEffect(() => {
    console.log('Users state updated:', users)
  }, [users])

  const fetchTaskGroups = async () => {
    const { data, error } = await supabase
      .from('task_groups')
      .select('id, name, color, description')
      .order('name')
    
    if (!error && data) {
      // Filter out duplicates by name, keeping only the first occurrence
      const uniqueGroups = data.reduce((acc: TaskGroup[], current) => {
        const exists = acc.some(group => group.name === current.name);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setTaskGroups(uniqueGroups);
    }
  }

  const fetchUsers = async () => {
    console.log('Fetching users...')
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .order('name')
    
    console.log('Users response:', { data, error })
    
    if (!error && data) {
      console.log('Setting users state:', data)
      setUsers(data)
    }
  }

  const createTaskGroup = async (name: string, color: string) => {
    const { data, error } = await supabase
      .from('task_groups')
      .insert([{ name, color }])
      .select()
      .single()
    
    if (error) throw error
    
    if (data) {
      setTaskGroups(prev => [...prev, data])
      return data
    }
    
    throw new Error('Failed to create task group')
  }

  const updateField = (field: keyof TaskFormData, value: any) => {
    if (field === 'task_group_id') {
      const newGroup = value === 'no-group' ? null : value;
      const groupDetails = newGroup ? taskGroups.find(g => g.id === newGroup) : undefined;
      setFormData(prev => ({
        ...prev,
        task_group_id: newGroup,
        task_groups: groupDetails
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setIsFormActive(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TaskFormContext.Provider
      value={{
        formData,
        taskGroups,
        users,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
        onClose,
        isFormActive,
        createTaskGroup,
        resetForm
      }}
    >
      {children}
    </TaskFormContext.Provider>
  )
}

export function useTaskForm() {
  const context = useContext(TaskFormContext)
  if (!context) {
    throw new Error('useTaskForm must be used within a TaskFormProvider')
  }
  return context
} 