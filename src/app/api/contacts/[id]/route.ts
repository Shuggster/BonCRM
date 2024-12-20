import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contact = await request.json()
    const { id } = params

    // First verify if the assigned user exists
    if (contact.assigned_to && contact.assigned_to_type === 'user') {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', contact.assigned_to)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Invalid user assignment' },
          { status: 400 }
        )
      }
    }

    // Update contact using service role - include updated_at
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        job_title: contact.job_title,
        address_line1: contact.address_line1,
        address_line2: contact.address_line2,
        city: contact.city,
        region: contact.region,
        postcode: contact.postal_code,
        country: contact.country,
        website: contact.website,
        linkedin: contact.linkedin,
        twitter: contact.twitter,
        assigned_to: contact.assigned_to,
        assigned_to_type: contact.assigned_to_type,
        department: contact.department,
        notes: contact.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating contact:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in contacts API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 