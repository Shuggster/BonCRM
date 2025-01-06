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

    // Handle assignment
    if (contact.assigned_to && contact.assigned_to_type) {
      // First verify if the assigned entity exists
      if (contact.assigned_to_type === 'user') {
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', contact.assigned_to)
          .single()

        if (userError || !user) {
          console.error('User validation error:', userError)
          return NextResponse.json(
            { error: 'Invalid user assignment' },
            { status: 400 }
          )
        }
      }

      // Delete any existing assignments
      const { error: deleteError } = await supabaseAdmin
        .from('assignments')
        .delete()
        .match({
          assignable_id: id,
          assignable_type: 'contact'
        })

      if (deleteError) {
        console.error('Error deleting existing assignments:', deleteError)
        return NextResponse.json(
          { error: 'Failed to update assignment' },
          { status: 500 }
        )
      }

      // Create new assignment
      const { error: assignmentError } = await supabaseAdmin
        .from('assignments')
        .insert({
          assignable_id: id,
          assignable_type: 'contact',
          assigned_to: contact.assigned_to,
          assigned_to_type: contact.assigned_to_type
        })

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError)
        return NextResponse.json(
          { error: 'Failed to create assignment' },
          { status: 500 }
        )
      }
    } else {
      // If no assignment is specified, remove any existing assignments
      const { error: deleteError } = await supabaseAdmin
        .from('assignments')
        .delete()
        .match({
          assignable_id: id,
          assignable_type: 'contact'
        })

      if (deleteError) {
        console.error('Error deleting existing assignments:', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove assignment' },
          { status: 500 }
        )
      }
    }

    // Update contact
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
        postcode: contact.postcode,
        country: contact.country,
        website: contact.website,
        linkedin: contact.linkedin,
        twitter: contact.twitter,
        avatar_url: contact.avatar_url,
        tags: contact.tags || [],
        industry_id: contact.industry_id,
        department: contact.department,
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