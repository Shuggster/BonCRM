'use client'

import { createContext, useContext, useState } from 'react'

export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
}

interface TaskFormContextType {
  formData: TaskFormData
  updateField: (field: keyof TaskFormData, value: any) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: null
}

const TaskFormContext = createContext<TaskFormContextType | undefined>(undefined)

interface TaskFormProviderProps {
  children: React.ReactNode
  onSubmit: (data: TaskFormData) => Promise<void>
  initialData?: Partial<TaskFormData>
}

export function TaskFormProvider({ children, onSubmit, initialData }: TaskFormProviderProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    ...initialFormData,
    ...initialData
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
        updateField,
        handleSubmit,
        isSubmitting,
        error
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