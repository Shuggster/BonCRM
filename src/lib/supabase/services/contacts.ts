import { supabase } from '@/lib/supabase/client'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'other'
export type ConversionStatus = 'lead' | 'opportunity' | 'customer'

export interface Contact {
  id: string
  created_at: string
  first_name: string
  last_name: string | null
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
  updated_at: string
  department: string | null
  // Lead Management Fields
  lead_status: LeadStatus
  lead_source: LeadSource | null
  lead_score: number
  conversion_status: ConversionStatus
  first_contact_date: string | null
  last_contact_date: string | null
  expected_value: number | null
  probability: number | null
  next_follow_up: string | null
  // Assignment Fields
  assigned_to?: string | null
  assigned_to_type?: 'user' | 'team' | null
  assigned_user?: { id: string; name: string } | null
  assigned_team?: { id: string; name: string } | null
}

export const contactsService = {
  async getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        assignments!inner (
          id,
          assigned_to,
          assigned_to_type
        )
      `)
      .eq('assignments.assigned_to_type', 'user')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Get user details for assignments
    const userIds = [...new Set(data?.map(c => c.assignments?.[0]?.assigned_to).filter(Boolean) || [])]
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, metadata:raw_user_meta_data')
      .in('id', userIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    const userMap = (users || []).reduce((acc, user) => {
      acc[user.id] = {
        id: user.id,
        email: user.email,
        name: user.metadata?.full_name,
        department: user.metadata?.department
      }
      return acc
    }, {} as Record<string, any>)

    // Map assignments to contacts
    const mappedData = (data || []).map(contact => {
      const assignment = contact.assignments?.[0]
      const user = assignment ? userMap[assignment.assigned_to] : null
      
      return {
        ...contact,
        name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        assigned_to: assignment?.assigned_to || null,
        assigned_to_type: assignment?.assigned_to_type || null,
        assigned_user: user ? {
          id: user.id,
          name: user.name,
          department: user.department
        } : null,
        // Ensure lead management fields have defaults
        lead_status: contact.lead_status || 'new',
        lead_score: contact.lead_score || 0,
        conversion_status: contact.conversion_status || 'lead',
        expected_value: contact.expected_value || null,
        probability: contact.probability || null
      }
    })

    return mappedData
  },

  async updateContact(contact: Contact) {
    console.log('[Contacts Service] Updating contact:', contact)

    const response = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Contacts Service] Update error:', error)
      throw new Error(error.error || 'Failed to update contact')
    }

    return await response.json()
  },

  async updateLeadStatus(contactId: string, status: LeadStatus) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ lead_status: status })
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLeadScore(contactId: string, score: number) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ lead_score: score })
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async convertLead(contactId: string, status: ConversionStatus, expectedValue?: number) {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        conversion_status: status,
        expected_value: expectedValue,
        last_contact_date: new Date().toISOString()
      })
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 