'use client'

import React, { useState, useCallback } from "react"
import { ContactCard } from "./ContactCard"
import { BasicInfoTab } from "./tabs/BasicInfoTab"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddContactProps {
  formData: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    job_title: string;
    department: string;
    website: string;
    linkedin: string;
    twitter: string;
    address_line1: string;
    address_line2: string;
    city: string;
    region: string;
    postcode: string;
    country: string;
    industry_id: string;
    lead_status: string;
    lead_source: string;
    lead_score: number;
    expected_value: number;
    conversion_status: 'lead' | 'opportunity';
  };
  onFieldChange: (field: string, value: any) => void;
  className?: string;
}

export function AddContact({
  formData,
  onFieldChange,
  className,
}: AddContactProps) {
  console.log('AddContact component rendered')
  
  const supabase = createClientComponentClient()
  const { hide } = useSplitViewStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);

  // Log initial form state
  React.useEffect(() => {
    console.log('AddContact mounted with initial formData:', formData)
  }, [])

  const handleSubmit = async () => {
    console.log('handleSubmit called with formData:', formData)
    if (isSubmitting) return
    
    setError(null)
    setIsSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.first_name?.trim() || !formData.email?.trim()) {
        console.log('Validation failed:', { 
          first_name: formData.first_name,
          email: formData.email
        })
        setError('First name and email are required')
        return
      }

      // Get default organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (orgError || !org) {
        console.error('Failed to fetch organization:', orgError)
        setError('Failed to fetch organization')
        return
      }

      // Format and submit data
      const contactData = {
        ...formData,
        organization_id: org.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name?.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        job_title: formData.job_title?.trim() || undefined,
        department: formData.department?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        linkedin: formData.linkedin?.trim() || undefined,
        twitter: formData.twitter?.trim() || undefined,
        address_line1: formData.address_line1?.trim() || undefined,
        address_line2: formData.address_line2?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        region: formData.region?.trim() || undefined,
        postcode: formData.postcode?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        industry_id: formData.industry_id || undefined,
        lead_status: formData.lead_status || undefined,
        lead_source: formData.lead_source || undefined,
        lead_score: formData.lead_score || undefined,
        expected_value: formData.expected_value || undefined
      }

      console.log('Submitting contact data:', contactData)

      const { error: insertError } = await supabase
        .from('contacts')
        .insert([contactData])

      if (insertError) {
        console.error('Failed to create contact:', insertError)
        setError('Failed to create contact')
        return
      }

      console.log('Contact created successfully')
      toast.success('Contact created successfully')
      hide()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    console.log('AddContact handleChange called:', { field, value })
    console.log('Current formData:', formData)
    
    onFieldChange(field, value)
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('AddContact handleInputChange event:', e)
    const { name, value } = e.target
    console.log('AddContact handleInputChange:', { name, value })
    handleChange(name, value)
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    console.log('Form submitted via onSubmit, event:', e)
    e.preventDefault()
    handleSubmit()
  }

  return (
    <form 
      onSubmit={onSubmit} 
      className={`h-full flex flex-col rounded-b-2xl ${className}`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-none">
          <div 
            className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
            <ContactCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white">Add New Contact</h2>
                <p className="mt-1 text-sm text-white/70">Enter contact details below</p>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <div className="px-6">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="social">Social & Web</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="sales">Sales Info</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="basic">
                    <BasicInfoTab 
                      formData={formData}
                      onFieldChange={handleChange}
                    />
                  </TabsContent>

                  <TabsContent value="social">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input
                            value={formData.website}
                            onChange={e => handleChange('website', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter website URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>LinkedIn</Label>
                          <Input
                            value={formData.linkedin}
                            onChange={e => handleChange('linkedin', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter LinkedIn profile URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Twitter</Label>
                          <Input
                            value={formData.twitter}
                            onChange={e => handleChange('twitter', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter Twitter handle"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="address">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Address Line 1</Label>
                          <Input
                            value={formData.address_line1}
                            onChange={e => handleChange('address_line1', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter address line 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address Line 2</Label>
                          <Input
                            value={formData.address_line2}
                            onChange={e => handleChange('address_line2', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter address line 2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              value={formData.city}
                              onChange={e => handleChange('city', e.target.value)}
                              className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Region/State</Label>
                            <Input
                              value={formData.region}
                              onChange={e => handleChange('region', e.target.value)}
                              className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                              placeholder="Enter region or state"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              value={formData.postcode}
                              onChange={e => handleChange('postcode', e.target.value)}
                              className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                              placeholder="Enter postal code"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                              value={formData.country}
                              onChange={e => handleChange('country', e.target.value)}
                              className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                              placeholder="Enter country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sales">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Lead Status</Label>
                          <Input
                            value={formData.lead_status}
                            onChange={e => handleChange('lead_status', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter lead status"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Lead Source</Label>
                          <Input
                            value={formData.lead_source}
                            onChange={e => handleChange('lead_source', e.target.value)}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter lead source"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Lead Score</Label>
                          <Input
                            type="number"
                            value={formData.lead_score}
                            onChange={e => handleChange('lead_score', parseInt(e.target.value))}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter lead score"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Expected Value</Label>
                          <Input
                            type="number"
                            value={formData.expected_value}
                            onChange={e => handleChange('expected_value', parseInt(e.target.value))}
                            className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                            placeholder="Enter expected value"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Fixed Save Button */}
              <div className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-[#111111] border-t border-white/10 flex justify-between items-center z-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => hide()}
                  className="text-white/70 border-white/10 hover:bg-white/5 px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </ContactCard>
          </div>
        </div>
      </div>
    </form>
  )
}