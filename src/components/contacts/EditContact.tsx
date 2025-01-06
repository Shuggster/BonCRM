'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Contact, ContactTag, LeadStatus, LeadSource, ConversionStatus } from "@/types"
import { cn } from "@/lib/utils"
import { 
  Phone, Mail, Building2, Briefcase, 
  Calendar, Tags, ChevronDown,
  LineChart, FileText, Users, User,
  Globe, Linkedin, Twitter, MapPin,
  Video, Tag, X, Factory, Check,
  Save, Plus, Trash2, Edit2,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSession } from "next-auth/react"
import { AssignTagsModal } from "./AssignTagsModal"
import { activityCalendarService } from "@/lib/supabase/services/activity-calendar"
import { UserSession } from "@/types/users"
import { LucideIcon } from 'lucide-react'

interface Industry {
  id: string
  name: string
  description: string | null
}

interface EditContactProps {
  contact: Contact
  section?: 'upper' | 'lower'
  onFieldUpdate: (field: keyof Contact, value: any) => void
  className?: string
}

const expandConfig = {
  initial: { height: 0, opacity: 0 },
  animate: { 
    height: "auto", 
    opacity: 1,
    transition: {
      height: {
        type: "spring",
        stiffness: 50,
        damping: 15
      },
      opacity: { duration: 0.2 }
    }
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: {
      height: {
        type: "spring",
        stiffness: 50,
        damping: 15
      },
      opacity: { duration: 0.2 }
    }
  }
}

interface ExpandableSectionProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}

function ExpandableSection({ title, icon: Icon, children }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-white">{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-zinc-400 transition-transform",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={expandConfig}
            className="relative overflow-visible"
          >
            <div className="px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function EditContact({ contact, section = 'upper', onFieldUpdate, className }: EditContactProps) {
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [newIndustryName, setNewIndustryName] = useState('')
  const [newIndustryDescription, setNewIndustryDescription] = useState('')
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [loading, setLoading] = useState(false)
  const [showIndustryForm, setShowIndustryForm] = useState(false)
  const [showAssignTagsModal, setShowAssignTagsModal] = useState(false)
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([])
  
  // Activity state
  const [title, setTitle] = useState("")
  const [activityType, setActivityType] = useState<'call' | 'email' | 'meeting' | 'follow_up'>('call')
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState<Date | null>(new Date())
  const [duration, setDuration] = useState(30)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const supabase = createClientComponentClient()

  // Activity icon helper
  const getActivityIcon = (type: string) => {
    const activityColors = {
      call: 'text-green-400',
      email: 'text-blue-400',
      meeting: 'text-purple-400',
      follow_up: 'text-orange-400'
    }

    switch (type) {
      case 'call':
        return <Phone className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'email':
        return <Mail className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'meeting':
        return <Video className={`w-5 h-5 ${activityColors[type as keyof typeof activityColors]}`} />
      case 'follow_up':
        return <ChevronDown className={`w-5 h-5 ${activityColors['follow_up']}`} />
      default:
        return <ChevronDown className={`w-5 h-5 ${activityColors['follow_up']}`} />
    }
  }

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!contact.id) return
      setLoadingActivities(true)
      try {
        const { data, error } = await activityCalendarService.getActivitiesByContactId(contact.id)
        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        console.error('Error fetching activities:', err)
      } finally {
        setLoadingActivities(false)
      }
    }

    fetchActivities()
  }, [contact.id, refreshKey])

  useEffect(() => {
    fetchIndustries()
    fetchTags()
  }, [])

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name')

      if (error) {
        console.error('Failed to fetch industries:', error.message)
        return
      }

      setIndustries(data || [])
    } catch (err) {
      console.error('Unexpected error fetching industries:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .order('name')

      if (error) {
        console.error('Failed to fetch tags:', error.message)
        return
      }

      setTags(data || [])
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const handleCreateIndustry = async () => {
    setLoading(true)
    try {
      if (!newIndustryName.trim()) {
        console.error('Industry name is required')
        return
      }

      const { error } = await supabase
        .from('industries')
        .insert({
          name: newIndustryName.trim(),
          description: newIndustryDescription.trim() || null
        })

      if (error) {
        console.error('Failed to create industry:', error.message)
        return
      }

      // Success - clear form and refresh
      setNewIndustryName('')
      setNewIndustryDescription('')
      setShowIndustryForm(false)
      await fetchIndustries()
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIndustry = async () => {
    if (!editingIndustry || !editingIndustry.name.trim()) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('industries')
        .update({
          name: editingIndustry.name.trim(),
          description: editingIndustry.description?.trim() || null
        })
        .eq('id', editingIndustry.id)

      if (error) {
        console.error('Supabase error updating industry:', error.message)
        return
      }

      await fetchIndustries()
      setEditingIndustry(null)
    } catch (error) {
      console.error('Error updating industry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIndustry = async (industryId: string) => {
    if (!confirm('Are you sure you want to delete this industry? This will remove it from all contacts.')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('industries')
        .delete()
        .eq('id', industryId)

      if (error) {
        console.error('Supabase error deleting industry:', error.message)
        return
      }

      await fetchIndustries()
    } catch (error) {
      console.error('Error deleting industry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize color for avatar
  const initials = `${contact.first_name?.[0] || ""}${contact.last_name?.[0] || ""}`.toUpperCase()
  const colors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-red-500 to-red-600",
  ]
  const colorIndex = (contact.first_name?.charCodeAt(0) || 0) % colors.length

  const inputClassName = cn(
    "border-white/10 focus:border-white/20 bg-black placeholder:text-white/40",
    className
  )

  // Upper section content
  if (section === 'upper') {
    return (
      <div className="rounded-t-2xl bg-[#111111] border-b border-white/[0.08]">
        {/* Main Contact Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Avatar/Initials */}
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-xl font-semibold text-white bg-gradient-to-br border border-white/10 overflow-hidden",
                colors[colorIndex]
              )}>
                <div className="flex items-center justify-center w-full h-full">
                  {initials}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    value={contact.first_name}
                    onChange={(e) => onFieldUpdate('first_name', e.target.value)}
                    className="bg-[#111111] border-white/10 focus:border-white/20 text-xl font-semibold w-[140px]"
                    placeholder="First Name"
                  />
                  <Input
                    value={contact.last_name}
                    onChange={(e) => onFieldUpdate('last_name', e.target.value)}
                    className="bg-[#111111] border-white/10 focus:border-white/20 text-xl font-semibold w-[140px]"
                    placeholder="Last Name"
                  />
                </div>
                <Input
                  value={contact.job_title || ''}
                  onChange={(e) => onFieldUpdate('job_title', e.target.value)}
                  className="bg-[#111111] border-white/10 focus:border-white/20 text-sm text-white/60 w-[280px]"
                  placeholder="Job Title"
                />
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="flex gap-2 sm:self-start">
              <a 
                href={`tel:${contact.phone}`}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Call"
              >
                <Phone className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
              </a>
              <a 
                href={`https://meet.google.com/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Start video call"
              >
                <Video className="w-5 h-5 text-purple-500 group-hover:text-purple-400" />
              </a>
              <a 
                href={`mailto:${contact.email}`}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                title="Send email"
              >
                <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Phone className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Phone</div>
                <Input
                  value={contact.phone || ''}
                  onChange={(e) => onFieldUpdate('phone', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
              <Mail className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Email</div>
                <Input
                  value={contact.email || ''}
                  onChange={(e) => onFieldUpdate('email', e.target.value)}
                  className="bg-[#111111] border-none focus:border-none text-white"
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable sections */}
        <div className="divide-y divide-white/[0.08]">
          <ExpandableSection 
            title="Contact Details" 
            icon={User}
          >
            {/* Company Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Building2 className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm text-zinc-400">Company</div>
                  <Input
                    value={contact.company || ''}
                    onChange={(e) => onFieldUpdate('company', e.target.value)}
                    className="bg-[#111111] border-none focus:border-none text-white"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm text-zinc-400">Department</div>
                  <Input
                    value={contact.department || ''}
                    onChange={(e) => onFieldUpdate('department', e.target.value)}
                    className="bg-[#111111] border-none focus:border-none text-white"
                    placeholder="Enter department"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Factory className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm text-zinc-400">Industry</div>
                  <Select
                    value={contact.industry_id?.toString() || ''}
                    onValueChange={(value) => onFieldUpdate('industry_id', value)}
                  >
                    <SelectTrigger className="bg-[#111111] border-none">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries?.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Social Media & Web Links */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white/90 mb-4">Social & Web</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Globe className="w-5 h-5 text-[#2196F3]" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Website</div>
                    <Input
                      value={contact.website || ''}
                      onChange={(e) => onFieldUpdate('website', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">LinkedIn</div>
                    <Input
                      value={contact.linkedin || ''}
                      onChange={(e) => onFieldUpdate('linkedin', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter LinkedIn URL"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Twitter</div>
                    <Input
                      value={contact.twitter || ''}
                      onChange={(e) => onFieldUpdate('twitter', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter Twitter handle"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>
          
          <ExpandableSection 
            title="Address Information" 
            icon={MapPin}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Address Line 1</div>
                    <Input
                      value={contact.address_line1 || ''}
                      onChange={(e) => onFieldUpdate('address_line1', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter address line 1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Address Line 2</div>
                    <Input
                      value={contact.address_line2 || ''}
                      onChange={(e) => onFieldUpdate('address_line2', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter address line 2"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">City</div>
                    <Input
                      value={contact.city || ''}
                      onChange={(e) => onFieldUpdate('city', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter city"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Region/State</div>
                    <Input
                      value={contact.region || ''}
                      onChange={(e) => onFieldUpdate('region', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter region/state"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Postal Code</div>
                    <Input
                      value={contact.postcode || ''}
                      onChange={(e) => onFieldUpdate('postcode', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-sm text-zinc-400">Country</div>
                    <Input
                      value={contact.country || ''}
                      onChange={(e) => onFieldUpdate('country', e.target.value)}
                      className="bg-[#111111] border-none focus:border-none text-white"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>
      </div>
    )
  }

  // Lower section content
  return (
    <div className="flex flex-col overflow-y-auto pb-24">
      {/* Company Information */}
      <div className="border-b border-white/10">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Company</Label>
              <Input
                value={contact.company || ''}
                onChange={(e) => onFieldUpdate('company', e.target.value)}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-white/20"
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Department</Label>
              <Input
                value={contact.department || ''}
                onChange={(e) => onFieldUpdate('department', e.target.value)}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-white/20"
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm text-zinc-400">
                <Factory className="w-5 h-5 text-blue-500" />
                Industry
              </Label>
              <Select
                value={contact.industry_id?.toString() || ''}
                onValueChange={(value) => onFieldUpdate('industry_id', value)}
              >
                <SelectTrigger className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:border-white/20">
                  <SelectValue placeholder="Select industry" className="text-white/40" />
                </SelectTrigger>
                <SelectContent className="bg-black border border-white/10">
                  <SelectItem value="_none" className="text-white hover:bg-white/10">None</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem 
                      key={industry.id} 
                      value={industry.id}
                      className="text-white hover:bg-white/10"
                    >
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Management */}
      <ExpandableSection title="Industry Management" icon={Factory}>
        <div className="space-y-6">
          {/* Add New Industry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/70">Add New Industry</Label>
              {showIndustryForm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIndustryForm(false)}
                  className="text-white/70"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
            
            {!showIndustryForm ? (
              <Button
                onClick={() => setShowIndustryForm(true)}
                variant="outline"
                className="w-full border-dashed bg-black border-white/10 hover:border-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Industry
              </Button>
            ) : (
              <div className="space-y-4 p-4 rounded-lg bg-black border border-white/10">
                <div className="space-y-2">
                  <Input
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    placeholder="Industry name"
                    className={inputClassName}
                  />
                  <Input
                    value={newIndustryDescription}
                    onChange={(e) => setNewIndustryDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className={inputClassName}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateIndustry}
                    disabled={loading || !newIndustryName.trim()}
                    className="bg-black border-white/10 hover:bg-white/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Industry
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Industries */}
          <div className="space-y-4">
            <Label className="text-sm text-white/70">Existing Industries</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-black border border-white/10 hover:border-white/20"
                >
                  {editingIndustry?.id === industry.id ? (
                    <>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingIndustry.name}
                          onChange={(e) =>
                            setEditingIndustry({ ...editingIndustry, name: e.target.value })
                          }
                          placeholder="Industry name"
                          className={inputClassName}
                        />
                        <Input
                          value={editingIndustry.description || ''}
                          onChange={(e) =>
                            setEditingIndustry({ ...editingIndustry, description: e.target.value })
                          }
                          placeholder="Description (optional)"
                          className={inputClassName}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUpdateIndustry}
                          disabled={loading}
                          className="text-green-500 hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIndustry(null)}
                          className="text-white/70"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{industry.name}</div>
                        {industry.description && (
                          <div className="text-sm text-white/60 mt-1 truncate">{industry.description}</div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIndustry(industry)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIndustry(industry.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Tag Management */}
      <ExpandableSection title="Tags" icon={Tags}>
        <div className="space-y-4">
          {/* Tag Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Assign or Remove Contact Tags</Label>
            <Select
              value="_select"
              onValueChange={async (tagId) => {
                if (tagId === "_select") return
                const currentTags = contact.tags || []
                let newTags: string[]
                
                // If tag is already selected, remove it
                if (currentTags.includes(tagId)) {
                  newTags = currentTags.filter(id => id !== tagId)
                  // Remove tag relation in Supabase
                  const { error } = await supabase
                    .from('contact_tag_relations')
                    .delete()
                    .eq('contact_id', contact.id)
                    .eq('tag_id', tagId)
                  
                  if (error) {
                    console.error('Error removing tag:', error)
                    return
                  }
                } else {
                  // Add the tag
                  newTags = [...currentTags, tagId]
                  // Add tag relation in Supabase
                  const { error } = await supabase
                    .from('contact_tag_relations')
                    .insert({
                      contact_id: contact.id,
                      tag_id: tagId
                    })
                  
                  if (error) {
                    console.error('Error adding tag:', error)
                    return
                  }
                }
                
                // Update local state
                onFieldUpdate('tags', newTags)
              }}
            >
              <SelectTrigger className="bg-black border-white/10 focus:border-white/20">
                <SelectValue placeholder="Click here to assign or remove tags from this contact" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/10">
                <div className="px-2 py-2 text-xs text-white/40">
                  Select a tag to assign or remove it from this contact
                </div>
                {tags.map((tag) => {
                  const isSelected = contact.tags?.includes(tag.id)
                  return (
                    <SelectItem 
                      key={tag.id} 
                      value={tag.id}
                      className="text-white hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Tags Display */}
          <div className="flex flex-wrap gap-2">
            {contact.tags?.map((tagId) => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null
              
              return (
                <div
                  key={tag.id}
                  className="group flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md bg-white/[0.02] border border-white/10 hover:border-white/20"
                >
                  <div
                    className="w-2 h-2 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-white/90">{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const currentTags = contact.tags || []
                      // Remove tag relation in Supabase
                      const { error } = await supabase
                        .from('contact_tag_relations')
                        .delete()
                        .eq('contact_id', contact.id)
                        .eq('tag_id', tag.id)
                      
                      if (error) {
                        console.error('Error removing tag:', error)
                        return
                      }
                      
                      // Update local state
                      onFieldUpdate('tags', currentTags.filter(id => id !== tag.id))
                    }}
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/90 hover:bg-white/5"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
            {(!contact.tags || contact.tags.length === 0) && (
              <div className="text-sm text-white/40">No tags assigned</div>
            )}
          </div>
        </div>
      </ExpandableSection>

      {/* Social Media & Web Links */}
      <ExpandableSection title="Social & Web Links" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Website</Label>
            <Input
              value={contact.website || ''}
              onChange={(e) => onFieldUpdate('website', e.target.value)}
              className={inputClassName}
              placeholder="Enter website URL"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">LinkedIn</Label>
            <Input
              value={contact.linkedin || ''}
              onChange={(e) => onFieldUpdate('linkedin', e.target.value)}
              className={inputClassName}
              placeholder="Enter LinkedIn URL"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Twitter</Label>
            <Input
              value={contact.twitter || ''}
              onChange={(e) => onFieldUpdate('twitter', e.target.value)}
              className={inputClassName}
              placeholder="Enter Twitter URL"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Facebook</Label>
            <Input
              value={contact.facebook || ''}
              onChange={(e) => onFieldUpdate('facebook', e.target.value)}
              className={inputClassName}
              placeholder="Enter Facebook URL"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">WhatsApp</Label>
            <Input
              value={contact.whatsapp || ''}
              onChange={(e) => onFieldUpdate('whatsapp', e.target.value)}
              className={inputClassName}
              placeholder="Enter WhatsApp URL"
            />
          </div>
        </div>
      </ExpandableSection>

      {/* Address Information */}
      <ExpandableSection title="Address Information" icon={MapPin}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Address Line 1</Label>
              <Input
                value={contact.address_line1 || ''}
                onChange={(e) => onFieldUpdate('address_line1', e.target.value)}
                className={inputClassName}
                placeholder="Enter address line 1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Address Line 2</Label>
              <Input
                value={contact.address_line2 || ''}
                onChange={(e) => onFieldUpdate('address_line2', e.target.value)}
                className={inputClassName}
                placeholder="Enter address line 2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-white/70">City</Label>
                <Input
                  value={contact.city || ''}
                  onChange={(e) => onFieldUpdate('city', e.target.value)}
                  className={inputClassName}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Region/State</Label>
                <Input
                  value={contact.region || ''}
                  onChange={(e) => onFieldUpdate('region', e.target.value)}
                  className={inputClassName}
                  placeholder="Enter region/state"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Postal Code</Label>
                <Input
                  value={contact.postcode || ''}
                  onChange={(e) => onFieldUpdate('postcode', e.target.value)}
                  className={inputClassName}
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Country</Label>
                <Input
                  value={contact.country || ''}
                  onChange={(e) => onFieldUpdate('country', e.target.value)}
                  className={inputClassName}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Lead Information */}
      <ExpandableSection title="Lead Information" icon={LineChart}>
        <div className="space-y-6 bg-black rounded-xl p-4">
          {/* Lead Status and Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Lead Status</Label>
              <Select
                value={contact.lead_status || undefined}
                onValueChange={(value: LeadStatus) => onFieldUpdate('lead_status', value)}
              >
                <SelectTrigger className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:border-white/20">
                  <SelectValue placeholder="Select status" className="text-white/40" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="new" className="text-white hover:bg-white/10">New</SelectItem>
                  <SelectItem value="contacted" className="text-white hover:bg-white/10">Contacted</SelectItem>
                  <SelectItem value="qualified" className="text-white hover:bg-white/10">Qualified</SelectItem>
                  <SelectItem value="proposal" className="text-white hover:bg-white/10">Proposal</SelectItem>
                  <SelectItem value="negotiation" className="text-white hover:bg-white/10">Negotiation</SelectItem>
                  <SelectItem value="won" className="text-white hover:bg-white/10">Won</SelectItem>
                  <SelectItem value="lost" className="text-white hover:bg-white/10">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Lead Source</Label>
              <Select
                value={contact.lead_source || undefined}
                onValueChange={(value: LeadSource) => onFieldUpdate('lead_source', value)}
              >
                <SelectTrigger className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:border-white/20">
                  <SelectValue placeholder="Select source" className="text-white/40" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="website" className="text-white hover:bg-white/10">Website</SelectItem>
                  <SelectItem value="referral" className="text-white hover:bg-white/10">Referral</SelectItem>
                  <SelectItem value="social_media" className="text-white hover:bg-white/10">Social Media</SelectItem>
                  <SelectItem value="email_campaign" className="text-white hover:bg-white/10">Email Campaign</SelectItem>
                  <SelectItem value="cold_call" className="text-white hover:bg-white/10">Cold Call</SelectItem>
                  <SelectItem value="event" className="text-white hover:bg-white/10">Event</SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-white/10">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversion Status */}
          <div className="space-y-3">
            <Label className="text-sm text-zinc-400">Conversion Status</Label>
            <Select
              value={contact.conversion_status || undefined}
              onValueChange={(value: ConversionStatus) => onFieldUpdate('conversion_status', value)}
            >
              <SelectTrigger className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:border-white/20">
                <SelectValue placeholder="Select conversion status" className="text-white/40" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="lead" className="text-white hover:bg-white/10">Lead</SelectItem>
                <SelectItem value="opportunity" className="text-white hover:bg-white/10">Opportunity</SelectItem>
                <SelectItem value="customer" className="text-white hover:bg-white/10">Customer</SelectItem>
                <SelectItem value="lost" className="text-white hover:bg-white/10">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lead Score and Expected Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Lead Score (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={contact.lead_score || ''}
                onChange={(e) => onFieldUpdate('lead_score', parseInt(e.target.value))}
                className={cn(inputClassName, "px-4 py-2")}
                placeholder="Enter score"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Expected Value (£)</Label>
              <Input
                type="number"
                min="0"
                value={contact.expected_value || ''}
                onChange={(e) => onFieldUpdate('expected_value', parseFloat(e.target.value))}
                className={cn(inputClassName, "px-4 py-2")}
                placeholder="Enter value"
              />
            </div>
          </div>

          {/* Probability and Next Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={contact.probability || ''}
                onChange={(e) => onFieldUpdate('probability', parseInt(e.target.value))}
                className={cn(inputClassName, "px-4 py-2")}
                placeholder="Enter probability"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm text-zinc-400">Next Follow-up</Label>
              <Input
                type="date"
                value={contact.next_follow_up || ''}
                onChange={(e) => onFieldUpdate('next_follow_up', e.target.value)}
                className={cn(inputClassName, "px-4 py-2")}
                placeholder="Select date"
              />
            </div>
          </div>

          {/* Visual Pipeline Stage */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-zinc-400">Pipeline Stage</Label>
              <span className="text-sm text-zinc-400">
                {contact.probability || 0}% Probability
              </span>
            </div>
            <div className="h-2 bg-black border border-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${contact.probability || 0}%` }}
              />
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Activities & Follow-ups */}
      <ExpandableSection title="Activities & Follow-ups" icon={Calendar}>
        <div className="space-y-6 bg-black rounded-xl p-4">
          {/* Activity Form */}
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!session) {
              setError('No user session found')
              return
            }
            if (!scheduledFor) {
              setError('Please select a date and time')
              return
            }

            setSaving(true)
            setError(null)

            try {
              const userSession = {
                user: {
                  id: session.user?.id || '',
                  email: session.user?.email || '',
                  department: session.user?.department || null
                }
              }

              await activityCalendarService.createActivityWithEvent(userSession as UserSession, {
                title: title.trim(),
                type: activityType,
                description: notes.trim() || undefined,
                contact_id: contact.id,
                scheduled_for: scheduledFor,
                duration_minutes: duration
              })

              // Clear form
              setTitle('')
              setActivityType('call')
              setNotes('')
              setScheduledFor(new Date())
              setDuration(30)
              
              // Refresh activities list
              setRefreshKey(prev => prev + 1)
            } catch (err: any) {
              console.error('Error scheduling activity:', err)
              setError(err?.message || 'Failed to schedule activity')
            } finally {
              setSaving(false)
            }
          }} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm text-white/70">Activity Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Follow-up call with client"
                className={cn(inputClassName, "px-4 py-2")}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm text-white/70">Activity Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'call', icon: Phone, label: 'Call', color: 'green' },
                    { type: 'email', icon: Mail, label: 'Email', color: 'blue' },
                    { type: 'meeting', icon: Video, label: 'Meeting', color: 'purple' },
                    { type: 'follow_up', icon: ArrowRight, label: 'Follow-up', color: 'orange' }
                  ].map(({ type, icon: Icon, label, color }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type as typeof activityType)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                        activityType === type
                          ? `bg-${color}-500/20 border-${color}-500/30 text-${color}-400`
                          : "bg-black border-white/10 hover:border-white/20 text-white/60 hover:text-white/90"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-white/70">Duration</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { duration: 15, label: '15m' },
                    { duration: 30, label: '30m' },
                    { duration: 45, label: '45m' },
                    { duration: 60, label: '1h' },
                    { duration: 90, label: '1.5h' },
                    { duration: 120, label: '2h' }
                  ].map(({ duration: dur, label }) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-colors text-sm",
                        duration === dur
                          ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                          : "bg-black border-white/10 hover:border-white/20 text-white/60 hover:text-white/90"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-white/70">Date & Time</Label>
              <Input
                type="datetime-local"
                value={scheduledFor?.toISOString().slice(0, 16) || ''}
                onChange={(e) => setScheduledFor(new Date(e.target.value))}
                className={cn(inputClassName, "px-4 py-2")}
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-white/70">Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or agenda items..."
                className={cn(
                  "min-h-[100px] w-full rounded-md border bg-black px-4 py-3 text-sm shadow-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  "border-white/10 focus:border-white/20"
                )}
              />
            </div>
          </form>
        </div>
      </ExpandableSection>

      {error && (
        <div className="px-6 py-4">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}
    </div>
  )
} 