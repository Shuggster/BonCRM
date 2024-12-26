import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/(auth)/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskGroupRow = Database['public']['Tables']['task_groups']['Row']

type TaskResponse = TaskRow & {
  task_groups: TaskGroupRow | null
}

export async function POST(request: Request) {
  try {
    const taskData = await request.json()

    // Get session from cookie - Tasks module REQUIRES auth
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare task data
    const taskInsert: TaskInsert = {
      title: taskData.title,
      description: taskData.description || null,
      status: 'todo', // Default status
      priority: taskData.priority || 'medium',
      due_date: taskData.dueDate || null,
      task_group_id: taskData.taskGroupId || null,
      user_id: session.user.id,
      assigned_to: taskData.assigned_to || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert task using service role
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert(taskInsert)
      .select('*, task_groups(*)')
      .single()

    if (error) {
      console.error('[API] Create task error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      throw new Error('No data returned from insert')
    }

    // Cast the response to our expected type
    const response = data as unknown as TaskResponse

    return NextResponse.json(response)
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
    // Get session from cookie - Tasks module REQUIRES auth
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task data and ID from request
    const task = await request.json()
    const searchParams = new URL(request.url).searchParams
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Add debug logging
    console.log('PUT request task data:', {
      assigned_to: task.assigned_to,
      assigned_to_type: task.assigned_to_type,
      department: task.department
    })

    if (task.assigned_to) {
      if (task.assigned_to_type === 'team') {
        console.log('Team assignment debug:', {
          assignedTeamId: task.assigned_to,
          validTeamIds: [
            '6978f1d4-23ca-47cc-bc09-7ab34b14db7d',  // Sales Support
            '81ee7afd-5d00-472e-b264-6d6e524a31b9',  // Trade Shop
            '9db18aee-4989-420e-9002-28c174ec2c3d',  // Sales and Marketing
            'a1a654a2-b270-4e24-be5f-45d9539d9cbc'   // Accounts
          ]
        });

        const teamExists = await supabaseAdmin
          .from('teams')
          .select('id, department, name')
          .eq('id', task.assigned_to)
          .single()
        
        if (teamExists.error) {
          console.log('Team validation failed:', teamExists.error)
          return NextResponse.json(
            { error: 'Invalid team assignment - team not found' },
            { status: 400 }
          )
        }
      }
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
        assigned_to: task.assigned_to || null,
        assigned_to_type: task.assigned_to ? task.assigned_to_type : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('*, task_groups(*)')
      .single()

    if (error) {
      console.error('[API] Update task error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cast the response to our expected type
    const response = data as unknown as TaskResponse

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] Task update failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    )
  }
}
