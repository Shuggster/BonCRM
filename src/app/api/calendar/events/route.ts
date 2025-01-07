import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Initialize Supabase client with service role key (RLS disabled)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Session validation with NextAuth only
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const contactId = searchParams.get('contact_id')

    let query = supabase
      .from('scheduled_activities')
      .select(`
        *,
        assigned_user:assigned_to(
          id,
          name,
          email,
          department
        )
      `)
      .eq('user_id', session.user.id)

    // If contact ID is provided, filter by it
    if (contactId) {
      query = query.eq('contact_id', contactId)
    }
    // If date range is provided, filter by it
    else if (start && end) {
      query = query
        .gte('scheduled_for', start)
        .lte('scheduled_for', end)
    }
    // If neither is provided, return error
    else if (!contactId) {
      return NextResponse.json(
        { error: 'Either contact_id or date range (start and end) is required' },
        { status: 400 }
      )
    }

    const { data: events, error } = await query.order('scheduled_for', { ascending: false })

    if (error) throw error

    // Transform the data to match the calendar event format
    const calendarEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.scheduled_for,
      end: new Date(new Date(event.scheduled_for).getTime() + event.duration_minutes * 60000).toISOString(),
      description: event.description,
      type: event.type,
      status: event.status,
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      assigned_user: event.assigned_user
    }))

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error('[ERROR] Server error in GET /api/calendar/events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Calculate duration in minutes
    const start = new Date(body.start)
    const end = new Date(body.end)
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    const { data: event, error } = await supabase
      .from('scheduled_activities')
      .insert({
        title: body.title,
        description: body.description,
        scheduled_for: start.toISOString(),
        duration_minutes: durationMinutes,
        type: body.type || 'calendar_event',
        user_id: session.user.id,
        contact_id: body.contact_id,
        assigned_to: body.assigned_to || session.user.id,
        assigned_to_type: body.assigned_to_type || 'user'
      })
      .select(`
        *,
        assigned_user:assigned_to(
          id,
          name,
          email,
          department
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      id: event.id,
      title: event.title,
      start: event.scheduled_for,
      end: new Date(new Date(event.scheduled_for).getTime() + event.duration_minutes * 60000).toISOString(),
      description: event.description,
      type: event.type,
      status: event.status,
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      assigned_user: event.assigned_user
    })
  } catch (error) {
    console.error('[ERROR] Server error in POST /api/calendar/events:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Calculate duration in minutes
    const start = new Date(body.start)
    const end = new Date(body.end)
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    const { data: event, error } = await supabase
      .from('scheduled_activities')
      .update({
        title: body.title,
        description: body.description,
        scheduled_for: start.toISOString(),
        duration_minutes: durationMinutes
      })
      .eq('id', id)
      .eq('user_id', session.user.id) // Ensure user owns the event
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: event.id,
      title: event.title,
      start: event.scheduled_for,
      end: new Date(new Date(event.scheduled_for).getTime() + event.duration_minutes * 60000).toISOString(),
      description: event.description
    })
  } catch (error) {
    console.error('[ERROR] Server error in PUT /api/calendar/events:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('scheduled_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id) // Ensure user owns the event

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ERROR] Server error in DELETE /api/calendar/events:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 