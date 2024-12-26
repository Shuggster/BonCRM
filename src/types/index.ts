export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'proposal'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email' | 'other'
export type ConversionStatus = 'lead' | 'opportunity' | 'customer' | 'lost'

export interface ContactTag {
  id: string
  name: string
  color: string
}

export interface ContactTagRelation {
  contact_id: string
  tag_id: string
  contact_tags: ContactTag
}

export interface Contact {
  id: string
  created_at?: string
  updated_at?: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  job_title?: string | null
  department?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  region?: string | null
  postcode?: string | null
  country?: string | null
  website?: string | null
  linkedin?: string | null
  twitter?: string | null
  facebook?: string | null
  whatsapp?: string | null
  avatar_url?: string | null
  tags?: string[]
  industry_id?: string | null
  lead_status?: LeadStatus | null
  lead_source?: LeadSource | null
  lead_score?: number | null
  conversion_status?: ConversionStatus | null
  first_contact_date?: string | null
  last_contact_date?: string | null
  expected_value?: number | null
  probability?: number | null
  next_follow_up?: string | null
  assigned_to?: string | null
  assigned_to_type?: string | null
  organization_id?: string | null
  pinned?: boolean
  contact_tag_relations?: ContactTagRelation[]
} 