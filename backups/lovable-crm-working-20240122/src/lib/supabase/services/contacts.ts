import { supabase } from '@/lib/supabase/client'

export interface Contact {
  id: string
  first_name: string
  last_name: string | null
  name: string | null
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
  assigned_to: string | null
  assigned_to_type: 'user' | 'team' | null
  department: string | null
  notes: string | null
  updated_at: string
  created_at: string
  tags: string[]
}

export const contactsService = {
  async getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return data || []
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
  }
} 