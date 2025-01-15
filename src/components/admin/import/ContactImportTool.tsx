"use client"

import { useState, useEffect } from 'react'
import { Upload, Plus } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import FieldMapping from './FieldMapping'
import { IndustryManagementModal } from '@/components/contacts/industry-management-modal'

interface ImportedData {
  headers: string[]
  rows: Record<string, any>[]
}

type ExtendedMapping = Record<string, keyof Contact | 'full_name'>

export default function ContactImportTool() {
  const [importedData, setImportedData] = useState<ImportedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldMapping, setFieldMapping] = useState<ExtendedMapping>({})
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null)
  const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([])
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Add constant for no industry option
  const NO_INDUSTRY = '_no_industry_'

  const fetchIndustries = async () => {
    const { data, error } = await supabase
      .from('industries')
      .select('id, name')
      .order('name')
    
    if (error) {
      console.error('Error fetching industries:', error)
      return
    }
    
    setIndustries(data || [])
  }

  useEffect(() => {
    fetchIndustries()
  }, [])

  const cleanFieldName = (field: string) => {
    // Remove BOM and other special characters
    return field.replace(/[\uFEFF\u200B]/g, '').trim()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      // Read the file
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          let headers: string[] = []
          let rows: Record<string, any>[] = []

          if (fileExtension === 'csv') {
            // Handle CSV file
            const text = data as string
            const lines = text.split('\n')
            if (lines.length > 0) {
              // Clean up headers - remove BOM and trim
              headers = lines[0].split(',').map(h => cleanFieldName(h))
              rows = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                  const values = line.split(',')
                  return headers.reduce((obj, header, index) => {
                    obj[header] = values[index]?.trim() || ''
                    return obj
                  }, {} as Record<string, any>)
                })
            }
          } else {
            // Handle Excel file
            const workbook = XLSX.read(data, { type: 'binary' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            
            if (jsonData.length > 0) {
              // Clean up headers
              headers = (jsonData[0] as string[]).map(h => cleanFieldName(h.toString()))
              rows = jsonData.slice(1).map((row: any[]) => {
                return headers.reduce((obj, header, index) => {
                  // Ensure we convert cell values to strings and handle empty cells
                  const cellValue = row[index]
                  obj[header] = cellValue !== undefined && cellValue !== null 
                    ? cellValue.toString().trim() 
                    : ''
                  return obj
                }, {} as Record<string, any>)
              })
            }
          }

          console.log('Cleaned headers:', headers)
          console.log('First row sample:', rows[0])

          setImportedData({ headers, rows })
          setStep('map')
          toast({
            title: "File uploaded successfully",
            description: `Found ${headers.length} columns and ${rows.length} rows`,
            variant: "default"
          })
        } catch (error) {
          console.error('Error parsing file:', error)
          toast({
            title: "Error parsing file",
            description: "Please make sure you're uploading a valid file",
            variant: "destructive"
          })
        }
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error uploading file",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMappingChange = (mapping: ExtendedMapping) => {
    setFieldMapping(mapping)
  }

  const processRow = (row: Record<string, any>, mapping: ExtendedMapping): Partial<Contact> => {
    const processedRow: Partial<Contact> = {}
    
    // Create a cleaned version of the row data
    const cleanedRow = Object.entries(row).reduce((acc, [key, value]) => {
      acc[cleanFieldName(key)] = value
      return acc
    }, {} as Record<string, any>)
    
    // Log the input for debugging
    console.log('Raw row data:', row)
    console.log('Cleaned row data:', cleanedRow)
    
    // Process each mapped field
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      // Clean the source field name
      const cleanedSourceField = cleanFieldName(sourceField)
      
      // Get the value from the cleaned row data
      let value = cleanedRow[cleanedSourceField]
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        value = ''
      }
      // Convert to string and trim
      value = value.toString().trim()
      
      console.log(`Processing field: ${cleanedSourceField} -> ${targetField} with value:`, value)
      
      if (targetField === 'full_name') {
        const nameParts = value.split(/\s+/)
        if (nameParts.length > 0) {
          processedRow.first_name = nameParts[0]
          processedRow.last_name = nameParts.slice(1).join(' ') || undefined
        }
      } else if (targetField === 'company') {
        // Explicitly set company name
        processedRow.company = value || undefined
        console.log('Set company name to:', value)
      } else {
        processedRow[targetField as keyof Contact] = value || undefined
      }
    })
    
    // Add industry if selected
    if (selectedIndustryId && selectedIndustryId !== NO_INDUSTRY) {
      processedRow.industry_id = selectedIndustryId
    }

    // Ensure first_name is never null
    if (!processedRow.first_name) {
      // Try to use company name if available
      if (processedRow.company) {
        processedRow.first_name = processedRow.company
      } else {
        // Use a default value as last resort
        processedRow.first_name = 'Unknown'
      }
    }
    
    // Log the final processed row
    console.log('Final processed row:', processedRow)
    
    return processedRow
  }

  const processImportedData = () => {
    if (!importedData) return []
    
    return importedData.rows.map(row => processRow(row, fieldMapping))
  }

  const validateMapping = (mapping: ExtendedMapping): string | null => {
    // Check if we have either name OR company mapped
    const hasFullName = Object.values(mapping).includes('full_name')
    const hasFirstName = Object.values(mapping).includes('first_name')
    const hasCompany = Object.values(mapping).includes('company')
    
    if (!hasFullName && !hasFirstName && !hasCompany) {
      return "Either Contact Name (First Name/Full Name) or Company Name is required. Please map at least one of these fields."
    }
    
    return null
  }

  const handleImport = async () => {
    try {
      setIsLoading(true)
      const processedData = processImportedData()
      
      // Validate data before import
      const invalidData = processedData.some(row => !row.first_name)
      if (invalidData) {
        toast({
          title: "Validation Error",
          description: "Some contacts are missing required fields. Please check your mapping.",
          variant: "destructive"
        })
        return
      }
      
      // Log the processed data for debugging
      console.log('Starting import with data:', processedData)
      
      // Insert contacts in batches of 50
      const batchSize = 50
      const batches = []
      
      for (let i = 0; i < processedData.length; i += batchSize) {
        batches.push(processedData.slice(i, i + batchSize))
      }
      
      let successCount = 0
      let errorCount = 0
      let errors: string[] = []
      
      console.log(`Processing ${batches.length} batches...`)
      
      for (const [index, batch] of batches.entries()) {
        try {
          console.log(`Importing batch ${index + 1}/${batches.length}:`, batch)
          
          const { data, error } = await supabase
            .from('contacts')
            .insert(batch.map(contact => ({
              first_name: contact.first_name,  // This will never be null now
              last_name: contact.last_name || null,
              email: contact.email || null,
              phone: contact.phone || null,
              company: contact.company || null,
              industry_id: contact.industry_id || null,
            })))
            .select()
          
          if (error) {
            console.error('Error importing batch:', error)
            errorCount += batch.length
            errors.push(error.message)
            
            toast({
              title: "Batch import error",
              description: `Failed to import batch ${index + 1}: ${error.message}`,
              variant: "destructive"
            })
          } else {
            const imported = data?.length || 0
            successCount += imported
            console.log(`Successfully imported ${imported} contacts from batch ${index + 1}`)
          }
        } catch (batchError: any) {
          console.error(`Error processing batch ${index + 1}:`, batchError)
          errorCount += batch.length
          errors.push(batchError.message || 'Unknown error')
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${successCount} contacts${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
          variant: "default"
        })
        // Reset the form
        setStep('upload')
        setImportedData(null)
        setFieldMapping({})
        setSelectedIndustryId(null)
      } else {
        toast({
          title: "Import failed",
          description: errors.length > 0 
            ? `Failed to import contacts: ${errors[0]}`
            : "Failed to import contacts. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error importing contacts:', error)
      toast({
        title: "Import failed",
        description: error?.message || "An unexpected error occurred while importing contacts.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-white/10">
            <Upload className="w-8 h-8 mb-4 text-white/50" />
            <Button variant="outline" disabled={isLoading}>
              <label className="cursor-pointer">
                {isLoading ? "Processing..." : "Select File"}
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </label>
            </Button>
          </div>
        )

      case 'map':
        return importedData && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Assign Industry (Optional)
                </label>
                <div className="flex gap-2 items-start">
                  <Select
                    value={selectedIndustryId || NO_INDUSTRY}
                    onValueChange={setSelectedIndustryId}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select an industry..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      <SelectItem value={NO_INDUSTRY} className="bg-background hover:bg-accent">No Industry</SelectItem>
                      {industries.map((industry) => (
                        <SelectItem 
                          key={industry.id} 
                          value={industry.id}
                          className="bg-background hover:bg-accent"
                        >
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsIndustryModalOpen(true)}
                    title="Manage Industries"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This industry will be assigned to all imported contacts
                </p>
              </div>
              
              <FieldMapping
                sourceFields={importedData.headers}
                onMappingChange={handleMappingChange}
                currentMapping={fieldMapping}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={() => setStep('preview')}>
                Preview Import
              </Button>
            </div>
          </div>
        )

      case 'preview':
        return importedData && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-lg">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      {Object.entries(fieldMapping)
                        .filter(([_, targetField]) => targetField !== undefined && targetField !== '')
                        .map(([sourceField, targetField]) => (
                          <th key={sourceField} className="p-2 text-left border-b border-white/10 whitespace-nowrap min-w-[150px]">
                            {targetField} ({sourceField})
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importedData.rows.slice(0, 10).map((row, index) => {
                      // Process the row first
                      const processedRow = processRow(row, fieldMapping)
                      console.log('Row data:', row)
                      console.log('Processed row:', processedRow)
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                          {Object.entries(fieldMapping)
                            .filter(([_, targetField]) => targetField !== undefined && targetField !== '')
                            .map(([sourceField, targetField]) => {
                              let displayValue = row[sourceField]
                              if (displayValue === undefined || displayValue === null) {
                                displayValue = ''
                              }
                              console.log(`Field ${sourceField} -> ${targetField}:`, displayValue)
                              
                              return (
                                <td key={sourceField} className="p-2 border-t border-white/10 truncate max-w-[300px]">
                                  {displayValue.toString()}
                                </td>
                              )
                            })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {importedData.rows.length > 10 && (
                <div className="p-2 text-sm text-center text-muted-foreground border-t border-white/10">
                  Showing 10 of {importedData.rows.length} rows
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setStep('map')}>
                Back
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isLoading}
              >
                {isLoading ? 'Importing...' : 'Import Contacts'}
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Contacts</CardTitle>
        <CardDescription>
          Import contacts from Excel (.xlsx, .xls) or CSV files
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStep()}
        <IndustryManagementModal 
          isOpen={isIndustryModalOpen}
          onClose={() => setIsIndustryModalOpen(false)}
          onIndustriesUpdated={() => {
            // Refresh industries list
            fetchIndustries()
          }}
        />
      </CardContent>
    </Card>
  )
} 