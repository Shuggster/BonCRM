import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task data from request
    const task = await request.json()

    // Insert task using service role
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        task_group_id: task.taskGroupId,
      })
      .select(`
        *,
        task_groups (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error('[API] Create task error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform dates
    const transformedTask = {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      taskGroupId: data.task_group_id
    }

    return NextResponse.json(transformedTask)
  } catch (error: any) {
    console.error('[API] Task creation failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task data and ID from request
    const task = await request.json()
    const searchParams = new URL(request.url).searchParams
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Update task using service role
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        task_group_id: task.taskGroupId,
      })
      .eq('id', taskId)
      .select(`
        *,
        task_groups (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error('[API] Update task error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform dates
    const transformedTask = {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      taskGroupId: data.task_group_id
    }

    return NextResponse.json(transformedTask)
  } catch (error: any) {
    console.error('[API] Task update failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    )
  }
}
