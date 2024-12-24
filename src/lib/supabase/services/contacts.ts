import { supabase } from '@/lib/supabase/client'

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
  // These come from assignments
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
        } : null
      }
    })

    console.log('Mapped contacts:', mappedData.map(c => ({
      id: c.id,
      name: c.name,
      assigned_type: c.assigned_to_type,
      assigned_user: c.assigned_user?.name
    })))

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
  }
} 