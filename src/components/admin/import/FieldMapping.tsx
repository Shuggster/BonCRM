"use client"

import { Contact } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useRef } from 'react'

interface FieldMappingProps {
  sourceFields: string[]
  onMappingChange: (mapping: Record<string, keyof Contact | 'full_name'>) => void
  currentMapping: Record<string, keyof Contact | 'full_name'>
}

// Special value for "Do not import" option
const DO_NOT_IMPORT = '_do_not_import_' as const

const TARGET_FIELDS: Array<{ key: keyof Contact | 'full_name'; label: string; description?: string }> = [
  { key: 'full_name', label: 'Full Name', description: 'Combined first and last name (will be split automatically)' },
  { key: 'first_name', label: 'First Name', description: 'Contact\'s first name' },
  { key: 'last_name', label: 'Last Name', description: 'Contact\'s last name' },
  { key: 'email', label: 'Email Address', description: 'Primary email contact' },
  { key: 'phone', label: 'Phone Number', description: 'Primary phone contact' },
  { key: 'company', label: 'Company Name', description: 'Organization name' },
  { key: 'job_title', label: 'Job Title', description: 'Position in company' },
  { key: 'department', label: 'Department', description: 'Department or division' },
  { key: 'address_line1', label: 'Address Line 1', description: 'Primary address' },
  { key: 'address_line2', label: 'Address Line 2', description: 'Additional address info' },
  { key: 'city', label: 'City', description: 'City/Town' },
  { key: 'region', label: 'Region', description: 'State/Province/Region' },
  { key: 'postcode', label: 'Postal Code', description: 'ZIP/Postal code' },
  { key: 'country', label: 'Country', description: 'Country name' },
  { key: 'website', label: 'Website', description: 'Company or personal website' },
  { key: 'linkedin', label: 'LinkedIn', description: 'LinkedIn profile URL' },
  { key: 'twitter', label: 'Twitter', description: 'Twitter handle or URL' },
  { key: 'facebook', label: 'Facebook', description: 'Facebook profile URL' },
  { key: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp contact' },
  { key: 'notes', label: 'Notes', description: 'Additional notes' },
  { key: 'lead_status', label: 'Lead Status', description: 'Current lead status' },
  { key: 'lead_source', label: 'Lead Source', description: 'How the lead was acquired' },
  { key: 'lead_score', label: 'Lead Score', description: 'Numerical lead score' },
  { key: 'conversion_status', label: 'Conversion Status', description: 'Current conversion status' }
]

// Add function to suggest initial mappings
const getInitialSuggestion = (sourceField: string): keyof Contact | 'full_name' | typeof DO_NOT_IMPORT => {
  const fieldLower = sourceField.toLowerCase().trim()
  
  // Add specific mapping for company field variations
  if (fieldLower.includes('company') || fieldLower.includes('business') || fieldLower === 'companyname' || fieldLower === 'company name') {
    return 'company'
  }
  
  // Rest of the mapping logic...
  if (fieldLower.includes('name') && !fieldLower.includes('last') && !fieldLower.includes('first')) {
    return 'full_name'
  }
  if (fieldLower.includes('first') || fieldLower === 'firstname') {
    return 'first_name'
  }
  if (fieldLower.includes('last') || fieldLower === 'lastname') {
    return 'last_name'
  }
  if (fieldLower.includes('email')) {
    return 'email'
  }
  if (fieldLower.includes('phone') || fieldLower.includes('tel')) {
    return 'phone'
  }
  if (fieldLower.includes('post') || fieldLower.includes('zip')) {
    return 'postcode'
  }
  
  return DO_NOT_IMPORT
}

const cleanFieldName = (field: string) => {
  // Remove BOM and other special characters
  return field.replace(/[\uFEFF\u200B]/g, '').trim()
}

export default function FieldMapping({ sourceFields, onMappingChange, currentMapping }: FieldMappingProps) {
  // Add ref to track initial mapping
  const initialMappingDone = useRef(false)

  const handleFieldMap = (sourceField: string, value: string) => {
    const newMapping = { ...currentMapping }
    if (value === DO_NOT_IMPORT) {
      delete newMapping[sourceField]
    } else {
      newMapping[sourceField] = value as keyof Contact | 'full_name'
    }
    onMappingChange(newMapping)
  }

  // Initialize mappings with suggestions only once
  useEffect(() => {
    if (!initialMappingDone.current && Object.keys(currentMapping).length === 0) {
      const initialMapping: Record<string, keyof Contact | 'full_name'> = {}
      sourceFields.forEach(field => {
        // Clean the field name before getting suggestion
        const cleanedField = cleanFieldName(field)
        const suggestion = getInitialSuggestion(cleanedField)
        if (suggestion !== DO_NOT_IMPORT) {
          initialMapping[field] = suggestion
        }
      })
      if (Object.keys(initialMapping).length > 0) {
        onMappingChange(initialMapping)
      }
      initialMappingDone.current = true
    }
  }, [sourceFields, onMappingChange, currentMapping])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {sourceFields.map((sourceField) => {
            // Clean the field name for display
            const cleanedField = cleanFieldName(sourceField)
            return (
              <div key={sourceField} className="flex items-center gap-4">
                <div className="w-1/3">
                  <p className="text-sm font-medium">{cleanedField}</p>
                </div>
                <div className="w-2/3">
                  <Select
                    value={currentMapping[sourceField] || DO_NOT_IMPORT}
                    onValueChange={(value) => handleFieldMap(sourceField, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a field..." />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="bg-background border border-border min-w-[200px] max-h-[300px]"
                      sideOffset={5}
                    >
                      <SelectItem value={DO_NOT_IMPORT} className="bg-background hover:bg-accent">Do not import</SelectItem>
                      {TARGET_FIELDS.map(({ key, label, description }) => (
                        <SelectItem key={key} value={key} className="bg-background hover:bg-accent">
                          <div className="flex flex-col">
                            <span>{label}</span>
                            {description && (
                              <span className="text-xs text-muted-foreground">{description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 