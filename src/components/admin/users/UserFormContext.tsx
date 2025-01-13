'use client'

import { createContext, useContext, useState } from 'react'

interface UserFormData {
  name: string
  email: string
  role: string
  department: string
}

interface UserFormContextType {
  formData: UserFormData
  updateField: (field: keyof UserFormData, value: any) => void
  resetForm: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

const UserFormContext = createContext<UserFormContextType | null>(null)

export function UserFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
    department: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: ''
    })
    setError(null)
  }

  return (
    <UserFormContext.Provider value={{
      formData,
      updateField,
      resetForm,
      isSubmitting,
      setIsSubmitting,
      error,
      setError
    }}>
      {children}
    </UserFormContext.Provider>
  )
}

export function useUserForm() {
  const context = useContext(UserFormContext)
  if (!context) {
    throw new Error('useUserForm must be used within a UserFormProvider')
  }
  return context
} 