'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CalendarEvent } from '@/types/calendar'

interface CalendarFormContextType {
  formData: Partial<CalendarEvent>
  setFormData: (data: Partial<CalendarEvent>) => void
  handleSubmit: () => Promise<void>
  handleCancel: () => void
  isSubmitting: boolean
  error: string | null
}

interface CalendarFormProviderProps {
  children: ReactNode
  onSubmit: (data: Partial<CalendarEvent>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<CalendarEvent>
}

const CalendarFormContext = createContext<CalendarFormContextType | null>(null)

export function CalendarFormProvider({ 
  children, 
  onSubmit, 
  onCancel, 
  initialData = {} 
}: CalendarFormProviderProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <CalendarFormContext.Provider
      value={{
        formData,
        setFormData,
        handleSubmit,
        handleCancel,
        isSubmitting,
        error
      }}
    >
      {children}
    </CalendarFormContext.Provider>
  )
}

export function useCalendarForm() {
  const context = useContext(CalendarFormContext)
  if (!context) {
    throw new Error('Calendar form components must be used within CalendarFormProvider')
  }
  return context
} 