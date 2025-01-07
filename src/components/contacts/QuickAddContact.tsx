'use client'

import { useState, useEffect } from 'react'
import { useContactForm } from './ContactFormContext'
import { Input } from "@/components/ui/input"
import { motion } from 'framer-motion'
import { 
  Plus, Mail, Phone, Building2, User2, Briefcase, Factory, 
  MapPin, Globe, Twitter, Linkedin, DollarSign, Target, 
  BarChart, Facebook, MessageCircle, ChevronDown, Save, X 
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { TeamSelect } from '@/components/ui/team-select'

interface Industry {
  id: string
  name: string
  description: string | null
}

interface Tag {
  id: string
  name: string
  color: string
}

interface QuickAddContactProps {
  onSuccess: (data: any) => void
  onCancel: () => void
  section?: 'upper' | 'lower'
}

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

interface ExpandableSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
}

function ExpandableSection({ title, icon, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium text-white group"
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <ChevronDown className={cn("w-5 h-5 text-white/40 transition-transform", isExpanded && "rotate-180")} />
      </button>
      {isExpanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

function QuickAddContactSection({ 
  section, 
  formData, 
  onFieldUpdate,
  industries,
  tags,
  showTagSelect,
  setShowTagSelect,
  showTagInput,
  setShowTagInput,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  handleTagCreate
}: { 
  section: 'upper' | 'lower'
  formData: ContactFormData
  onFieldUpdate: (field: keyof ContactFormData, value: any) => void
  industries: Industry[]
  tags: Tag[]
  showTagSelect: boolean
  setShowTagSelect: (show: boolean) => void
  showTagInput: boolean
  setShowTagInput: (show: boolean) => void
  newTagName: string
  setNewTagName: (name: string) => void
  newTagColor: string
  setNewTagColor: (color: string) => void
  handleTagCreate: () => Promise<void>
}) {
  if (section === 'upper') {
    return (
      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Add Contact</h2>
          <p className="text-sm text-white/70">Create a new contact in your CRM</p>
        </div>

        {/* Personal Information */}
        <ExpandableSection 
          title="Personal Information" 
          icon={<User2 className="w-5 h-5 text-blue-500" />}
          defaultExpanded={true}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">First Name *</label>
              <Input
                value={formData.first_name}
                onChange={(e) => onFieldUpdate('first_name', e.target.value)}
                placeholder="First Name"
                required
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Last Name</label>
              <Input
                value={formData.last_name}
                onChange={(e) => onFieldUpdate('last_name', e.target.value)}
                placeholder="Last Name"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Email *</label>
            <Input
              value={formData.email}
              onChange={(e) => onFieldUpdate('email', e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => onFieldUpdate('phone', e.target.value)}
              placeholder="Phone"
              type="tel"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
        </ExpandableSection>

        {/* Work Information */}
        <ExpandableSection 
          title="Work Information" 
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => onFieldUpdate('company', e.target.value)}
                placeholder="Company"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Job Title</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => onFieldUpdate('job_title', e.target.value)}
                  placeholder="Job Title"
                  className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => onFieldUpdate('department', e.target.value)}
                  placeholder="Department"
                  className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Industry</label>
              <Select
                value={formData.industry_id}
                onValueChange={(value) => onFieldUpdate('industry_id', value)}
              >
                <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                  <SelectValue placeholder="Select Industry" className="text-white/40" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id} className="text-sm text-white/90 focus:bg-white/10">
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Assign To</label>
              <TeamSelect
                onSelect={(selection) => {
                  onFieldUpdate('team_id', selection.id)
                  onFieldUpdate('team_type', selection.type)
                }}
                disabled={false}
                allowCrossDepartment={true}
                className="bg-black"
              />
            </div>
          </div>
        </ExpandableSection>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Social & Web Links */}
      <ExpandableSection 
        title="Social & Web Links" 
        icon={<Globe className="w-5 h-5 text-blue-500" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => onFieldUpdate('website', e.target.value)}
              placeholder="Website URL"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">LinkedIn</label>
            <Input
              value={formData.linkedin}
              onChange={(e) => onFieldUpdate('linkedin', e.target.value)}
              placeholder="LinkedIn Profile"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Twitter</label>
            <Input
              value={formData.twitter}
              onChange={(e) => onFieldUpdate('twitter', e.target.value)}
              placeholder="Twitter Handle"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Facebook</label>
            <Input
              value={formData.facebook}
              onChange={(e) => onFieldUpdate('facebook', e.target.value)}
              placeholder="Facebook Profile"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">WhatsApp</label>
            <Input
              value={formData.whatsapp}
              onChange={(e) => onFieldUpdate('whatsapp', e.target.value)}
              placeholder="WhatsApp Number"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
        </div>
      </ExpandableSection>

      {/* Address Information */}
      <ExpandableSection 
        title="Address Information" 
        icon={<MapPin className="w-5 h-5 text-blue-500" />}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Address Line 1</label>
            <Input
              value={formData.address_line1}
              onChange={(e) => onFieldUpdate('address_line1', e.target.value)}
              placeholder="Street Address"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Address Line 2</label>
            <Input
              value={formData.address_line2}
              onChange={(e) => onFieldUpdate('address_line2', e.target.value)}
              placeholder="Apt, Suite, etc."
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">City</label>
              <Input
                value={formData.city}
                onChange={(e) => onFieldUpdate('city', e.target.value)}
                placeholder="City"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Region/State</label>
              <Input
                value={formData.region}
                onChange={(e) => onFieldUpdate('region', e.target.value)}
                placeholder="Region/State"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Postal Code</label>
              <Input
                value={formData.postcode}
                onChange={(e) => onFieldUpdate('postcode', e.target.value)}
                placeholder="Postal Code"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => onFieldUpdate('country', e.target.value)}
                placeholder="Country"
                className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Lead Information */}
      <ExpandableSection 
        title="Lead Information" 
        icon={<Target className="w-5 h-5 text-blue-500" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Lead Status</label>
            <Select
              value={formData.lead_status}
              onValueChange={(value) => onFieldUpdate('lead_status', value)}
            >
              <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10">
                <SelectItem value="new" className="text-white/90 focus:bg-white/10 focus:text-white">New</SelectItem>
                <SelectItem value="contacted" className="text-white/90 focus:bg-white/10 focus:text-white">Contacted</SelectItem>
                <SelectItem value="qualified" className="text-white/90 focus:bg-white/10 focus:text-white">Qualified</SelectItem>
                <SelectItem value="proposal" className="text-white/90 focus:bg-white/10 focus:text-white">Proposal</SelectItem>
                <SelectItem value="negotiation" className="text-white/90 focus:bg-white/10 focus:text-white">Negotiation</SelectItem>
                <SelectItem value="won" className="text-white/90 focus:bg-white/10 focus:text-white">Won</SelectItem>
                <SelectItem value="lost" className="text-white/90 focus:bg-white/10 focus:text-white">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Conversion Status</label>
            <Select
              value={formData.conversion_status}
              onValueChange={(value) => onFieldUpdate('conversion_status', value)}
            >
              <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10">
                <SelectItem value="lead" className="text-white/90 focus:bg-white/10 focus:text-white">Lead</SelectItem>
                <SelectItem value="opportunity" className="text-white/90 focus:bg-white/10 focus:text-white">Opportunity</SelectItem>
                <SelectItem value="customer" className="text-white/90 focus:bg-white/10 focus:text-white">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Lead Source</label>
            <Select
              value={formData.lead_source}
              onValueChange={(value) => onFieldUpdate('lead_source', value)}
            >
              <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10">
                <SelectItem value="website" className="text-white/90 focus:bg-white/10 focus:text-white">Website</SelectItem>
                <SelectItem value="referral" className="text-white/90 focus:bg-white/10 focus:text-white">Referral</SelectItem>
                <SelectItem value="social_media" className="text-white/90 focus:bg-white/10 focus:text-white">Social Media</SelectItem>
                <SelectItem value="event" className="text-white/90 focus:bg-white/10 focus:text-white">Event</SelectItem>
                <SelectItem value="cold_call" className="text-white/90 focus:bg-white/10 focus:text-white">Cold Call</SelectItem>
                <SelectItem value="email_campaign" className="text-white/90 focus:bg-white/10 focus:text-white">Email Campaign</SelectItem>
                <SelectItem value="partner" className="text-white/90 focus:bg-white/10 focus:text-white">Partner</SelectItem>
                <SelectItem value="other" className="text-white/90 focus:bg-white/10 focus:text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Lead Score</label>
            <Input
              type="number"
              value={formData.lead_score}
              onChange={(e) => onFieldUpdate('lead_score', parseInt(e.target.value) || 0)}
              placeholder="Lead Score"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Expected Value</label>
            <Input
              type="number"
              value={formData.expected_value}
              onChange={(e) => onFieldUpdate('expected_value', parseInt(e.target.value) || 0)}
              placeholder="Expected Value"
              className="bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
            />
          </div>
        </div>
      </ExpandableSection>

      {/* Tags */}
      <ExpandableSection 
        title="Tags" 
        icon={<MessageCircle className="w-5 h-5 text-blue-500" />}
      >
        <div className="space-y-2">
          <label className="text-sm text-white/70">Contact Tags</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setShowTagSelect(true)
              }}
              className="h-7 px-2 border-dashed bg-black border-white/10 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Tag
            </Button>
          </div>
        </div>

        {showTagSelect && (
          <div className="space-y-2 bg-black rounded-lg p-3 border border-white/10">
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.length > 0 && (
                  <div className="w-full mb-2 flex flex-wrap gap-2">
                    {tags
                      .filter(tag => formData.tags.includes(tag.id))
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm transition-colors"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                          <button
                            onClick={() => {
                              const updatedTags = formData.tags.filter(t => t !== tag.id)
                              onFieldUpdate('tags', updatedTags)
                            }}
                            className="hover:opacity-75 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
                {tags
                  .filter(t => !formData.tags.includes(t.id))
                  .map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const updatedTags = [...formData.tags, tag.id]
                        onFieldUpdate('tags', updatedTags)
                        setShowTagSelect(false)
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                      <Plus className="h-3 w-3" />
                    </button>
                  ))}
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setShowTagSelect(false)
                    setShowTagInput(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:bg-white/5"
                >
                  Create New Tag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowTagSelect(false)}
                  className="bg-black border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {showTagInput && (
          <div className="space-y-2 bg-black rounded-lg p-3 border border-white/10">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name..."
                className="flex-1 h-8 bg-black border-white/10 focus:border-white/20 placeholder:text-white/40"
              />
              <Input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-8 h-8 p-1 bg-black border border-white/10 rounded"
              />
              <Button
                onClick={handleTagCreate}
                disabled={!newTagName.trim()}
                size="sm"
                type="button"
              >
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setShowTagInput(false)
                  setNewTagName("")
                }}
                className="h-8 bg-black border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ExpandableSection>
    </div>
  )
}

export function QuickAddContact({ onSuccess, onCancel, section = 'upper' }: QuickAddContactProps) {
  const supabase = createClientComponentClient()
  const { 
    formData, 
    updateField: onFieldUpdate, 
    resetForm, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError 
  } = useContactForm()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [showTagSelect, setShowTagSelect] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')

  useEffect(() => {
    fetchIndustries()
    fetchTags()
  }, [])

  const fetchIndustries = async () => {
    const { data: industriesData, error } = await supabase
        .from('industries')
        .select('*')
    if (!error && industriesData) {
      setIndustries(industriesData)
    }
  }

  const fetchTags = async () => {
    const { data: tagsData, error } = await supabase
        .from('contact_tags')
        .select('*')
    if (!error && tagsData) {
      setTags(tagsData)
    }
  }

  const handleTagCreate = async () => {
    if (!newTagName.trim()) return
    try {
      const { data: newTag, error } = await supabase
        .from('contact_tags')
        .insert([{ 
          name: newTagName.trim(), 
          color: newTagColor 
        }])
        .select('id, name, color')
        .single()

      if (error) throw error

      setTags([...tags, newTag])
      const updatedTags = [...formData.tags, newTag.id]
      onFieldUpdate('tags', updatedTags)
      setShowTagInput(false)
      setNewTagName("")
    } catch (err) {
      console.error('Error creating tag:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedFirstName = formData.first_name.trim()
    const trimmedEmail = formData.email.trim()
    
    if (!trimmedFirstName || !trimmedEmail) {
      setError('First name and email are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const dataToSubmit = {
        ...formData,
        first_name: trimmedFirstName,
        email: trimmedEmail,
        tags: formData.tags || [],
        conversion_status: 'lead',
        lead_status: 'new',
        lead_source: 'website',
        industry_id: formData.industry_id || 'ec3ef12c-04ac-48ff-9d86-2678618e8872',
        lead_score: 0,
        expected_value: 0,
        assigned_to: formData.team_id,
        assigned_to_type: formData.team_type
      }

      // Remove the old team fields that aren't in the schema
      delete dataToSubmit.team_id;
      delete dataToSubmit.team_type;

      await onSuccess(dataToSubmit)
      resetForm() // Reset form after successful submission
      onCancel() // Close the form
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Upper Section */}
        <motion.div
          key="add-upper"
          className="flex-none"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <QuickAddContactSection
                section="upper"
                formData={formData}
                onFieldUpdate={onFieldUpdate}
                industries={industries}
                tags={tags}
                showTagSelect={showTagSelect}
                setShowTagSelect={setShowTagSelect}
                showTagInput={showTagInput}
                setShowTagInput={setShowTagInput}
                newTagName={newTagName}
                setNewTagName={setNewTagName}
                newTagColor={newTagColor}
                setNewTagColor={setNewTagColor}
                handleTagCreate={handleTagCreate}
              />
            </div>
          </div>
        </motion.div>

        {/* Lower Section */}
        <motion.div
          key="add-lower"
          className="flex-1 min-h-0"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <div className="pb-24">
                <QuickAddContactSection
                  section="lower"
                  formData={formData}
                  onFieldUpdate={onFieldUpdate}
                  industries={industries}
                  tags={tags}
                  showTagSelect={showTagSelect}
                  setShowTagSelect={setShowTagSelect}
                  showTagInput={showTagInput}
                  setShowTagInput={setShowTagInput}
                  newTagName={newTagName}
                  setNewTagName={setNewTagName}
                  newTagColor={newTagColor}
                  setNewTagColor={setNewTagColor}
                  handleTagCreate={handleTagCreate}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-[#111111] border-t border-white/10 flex justify-between items-center z-50 rounded-b-2xl">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-white/70 border-white/10 hover:bg-white/5"
          type="button"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          type="submit"
          disabled={isSubmitting}
          className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? 'Creating...' : 'Create Contact'}
        </Button>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}
    </form>
  )
} 