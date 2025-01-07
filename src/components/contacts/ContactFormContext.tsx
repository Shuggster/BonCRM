'use client'

import React, { createContext, useContext, useState } from 'react'

interface ContactFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string
  job_title: string
  department: string
  website: string
  linkedin: string
  twitter: string
  facebook: string
  whatsapp: string
  address_line1: string
  address_line2: string
  city: string
  region: string
  postcode: string
  country: string
  lead_status: string
  lead_source: string
  conversion_status: string
  lead_score: number
  expected_value: number
  industry_id: string
  tags: string[]
  team_id?: string
  team_type?: 'user' | 'team'
}

interface ContactFormContextType {
  formData: ContactFormData
  updateField: (field: keyof ContactFormData, value: any) => void
  resetForm: () => void
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

const defaultFormData: ContactFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  job_title: '',
  department: '',
  website: '',
  linkedin: '',
  twitter: '',
  facebook: '',
  whatsapp: '',
  address_line1: '',
  address_line2: '',
  city: '',
  region: '',
  postcode: '',
  country: '',
  lead_status: '',
  lead_source: '',
  conversion_status: '',
  lead_score: 0,
  expected_value: 0,
  industry_id: '',
  tags: [],
}

const ContactFormContext = createContext<ContactFormContextType | undefined>(undefined)

export function ContactFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<ContactFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      department: '',
      website: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      whatsapp: '',
      address_line1: '',
      address_line2: '',
      city: '',
      region: '',
      postcode: '',
      country: '',
      lead_status: '',
      lead_source: '',
      conversion_status: '',
      lead_score: 0,
      expected_value: 0,
      industry_id: '',
      tags: [],
      team_id: '',
      team_type: undefined
    })
    setError(null)
    setIsSubmitting(false)
  }

  return (
    <ContactFormContext.Provider 
      value={{
        formData,
        updateField,
        resetForm,
        isSubmitting,
        setIsSubmitting,
        error,
        setError
      }}
    >
      {children}
    </ContactFormContext.Provider>
  )
}

export function useContactForm() {
  const context = useContext(ContactFormContext)
  if (context === undefined) {
    throw new Error('useContactForm must be used within a ContactFormProvider')
  }
  return context
} 