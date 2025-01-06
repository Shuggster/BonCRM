export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'

export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'other'

export type ConversionStatus = 'lead' | 'opportunity' | 'customer'

export interface Contact {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company: string | null
  job_title: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  region: string | null
  postcode: string | null
  country: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  avatar_url: string | null
  tags: string[]
  industry_id: string | null
  department: string | null
  lead_status: LeadStatus | null
  lead_source: LeadSource | null
  lead_score: number | null
  conversion_status: ConversionStatus | null
  first_contact_date: string | null
  last_contact_date: string | null
  expected_value: number | null
  probability: number | null
  next_follow_up: string | null
  assigned_to: string | null
  assigned_to_type: string | null
  organization_id: string | null
  pinned?: boolean
} 