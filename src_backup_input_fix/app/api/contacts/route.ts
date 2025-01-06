import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/(auth)/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get session from cookie - Now using same auth pattern as Tasks/Calendar
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select(`
        *,
        industries (
          id,
          name
        )
      `)
      .order('first_name', { ascending: true })
    
    if (error) throw error

    const transformedData = data?.map(contact => ({
      ...contact,
      name: contact.name || `${contact.first_name} ${contact.last_name || ''}`.trim(),
      tags: contact.tags || []
    }))

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('Error in /api/contacts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get session from cookie - Now using same auth pattern as Tasks/Calendar
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contact = await request.json()
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert(contact)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in /api/contacts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    )
  }
} 