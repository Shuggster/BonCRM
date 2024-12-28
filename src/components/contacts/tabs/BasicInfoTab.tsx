'use client'

import React from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface BasicInfoTabProps {
  formData: any
  onFieldChange: (field: string, value: any) => void
}

export function BasicInfoTab({ formData, onFieldChange }: BasicInfoTabProps) {
  console.log('BasicInfoTab rendered with formData:', formData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    console.log('BasicInfoTab handleChange event triggered')
    console.log('Event target:', {
      name: e.target.name,
      value: e.target.value,
      type: e.target.type,
      id: e.target.id
    })
    console.log('Current formData:', formData)
    onFieldChange(e.target.name, e.target.value)
  }

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    console.log('BasicInfoTab input clicked:', {
      name: e.currentTarget.name,
      id: e.currentTarget.id
    })
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    console.log('BasicInfoTab input focused:', {
      name: e.currentTarget.name,
      id: e.currentTarget.id
    })
  }

  // Direct input test function
  const testInput = (name: string) => {
    console.log(`Testing input ${name}:`, {
      element: document.querySelector(`input[name="${name}"]`),
      value: formData[name]
    })
  }

  // Test all inputs on mount
  React.useEffect(() => {
    console.log('BasicInfoTab mounted, testing inputs...')
    ;['first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 'department'].forEach(testInput)
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input
            type="text"
            name="first_name"
            id="first_name"
            value={formData.first_name}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input
            type="text"
            name="last_name"
            id="last_name"
            value={formData.last_name}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email *</Label>
        <Input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handleFocus}
          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handleFocus}
          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
          placeholder="Enter phone number"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            type="text"
            name="company"
            id="company"
            value={formData.company}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
            placeholder="Enter company name"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            type="text"
            name="job_title"
            id="job_title"
            value={formData.job_title}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
            placeholder="Enter job title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Department</Label>
        <Input
          type="text"
          name="department"
          id="department"
          value={formData.department}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handleFocus}
          className="bg-[#1C2333] border-white/10 focus:border-blue-500"
          placeholder="Enter department"
        />
      </div>
    </div>
  )
} 