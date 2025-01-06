import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '@/lib/utils/session'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a test task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test Task',
        description: 'Test task for calendar integration',
        status: 'todo',
        priority: 'medium',
        user_id: session.user.id
      })
      .select()
      .single()

    if (taskError) throw taskError

    // Create a test calendar event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: 'Test Event',
        description: 'Test event for task integration',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        category: 'task',
        user_id: session.user.id
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Create a relation between task and event
    const { data: relation, error: relationError } = await supabase
      .from('task_calendar_relations')
      .insert({
        task_id: task.id,
        event_id: event.id,
        relation_type: 'working_session',
        created_by: session.user.id
      })
      .select()
      .single()

    if (relationError) throw relationError

    return NextResponse.json({
      success: true,
      data: {
        task,
        event,
        relation
      }
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, eventId } = body

    // Create a relation between task and event
    const { data: relation, error: relationError } = await supabase
      .from('task_calendar_relations')
      .insert({
        task_id: taskId,
        event_id: eventId,
        relation_type: 'working_session',
        created_by: session.user.id
      })
      .select()
      .single()

    if (relationError) throw relationError

    return NextResponse.json({
      success: true,
      data: relation
    })
  } catch (error) {
    console.error('Failed to create relation:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 