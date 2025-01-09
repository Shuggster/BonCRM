'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  status: 'todo' | 'in-progress' | 'completed'
  task_group_id: string | null
  assigned_to: string | null
}

interface TaskFormContextType {
  formData: TaskFormData
  updateField: (field: keyof TaskFormData, value: any) => void
  onSubmit: (data: TaskFormData) => Promise<void>
  onClose: () => void
  error: string | null
  isSubmitting: boolean
}

const TaskFormContext = createContext<TaskFormContextType | undefined>(undefined)

export function TaskFormProvider({ children, onSubmit, onClose, initialData }: { 
  children: React.ReactNode
  onSubmit: (data: TaskFormData) => Promise<void>
  onClose: () => void
  initialData?: Partial<TaskFormData>
}) {
  const [formData, setFormData] = useState<TaskFormData>(() => ({
    title: '',
    description: '',
    priority: 'medium',
    due_date: null,
    status: 'todo',
    task_group_id: null,
    assigned_to: null,
    ...initialData
  }))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof TaskFormData, value: any) => {
    console.log(`Updating field ${field}:`, value)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (data: TaskFormData) => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TaskFormContext.Provider
      value={{
        formData,
        updateField,
        onSubmit: handleSubmit,
        onClose,
        error,
        isSubmitting
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