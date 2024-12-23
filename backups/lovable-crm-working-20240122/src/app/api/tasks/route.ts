import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to validate UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export async function POST(request: Request) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task data from request
    const task = await request.json()

    // Add more detailed logging
    console.log('Task assignment details:', {
      assigned_to: task.assigned_to,
      assigned_to_type: task.assigned_to_type,
      isUUID: isValidUUID(task.assigned_to),
      fullData: task
    })

    // Different validation based on type
    if (task.assigned_to) {
      // First validate department
      if (task.department) {
        const validDepartments = ['management', 'sales', 'accounts', 'trade_shop'];
        if (!validDepartments.includes(task.department)) {
          return NextResponse.json(
            { error: 'Invalid department assignment' },
            { status: 400 }
          )
        }
      }

      // Then validate user/team assignment
      if (task.assigned_to_type === 'user') {
        // Check if user exists AND is in the correct department
        const userExists = await supabaseAdmin
          .from('users')
          .select('id, department')
          .eq('id', task.assigned_to)
          .single()
        
        if (userExists.error || userExists.data.department !== task.department) {
          return NextResponse.json(
            { error: 'Invalid user assignment or department mismatch' },
            { status: 400 }
          )
        }
      } else if (task.assigned_to_type === 'team') {
        // Single team check
        const teamExists = await supabaseAdmin
          .from('teams')
          .select('id, department, name')
          .eq('id', task.assigned_to)
          .single()
        
        if (teamExists.error) {
          return NextResponse.json(
            { error: 'Invalid team assignment - team not found' },
            { status: 400 }
          )
        }

        // Verify team department if needed
        if (task.department && teamExists.data.department !== task.department) {
          return NextResponse.json(
            { error: 'Team department does not match task department' },
            { status: 400 }
          )
        }
      }
    }

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
        user_id: session.user.id,
        assigned_to: task.assigned_to_type === 'user' 
          ? task.assigned_to  // For users, use the ID directly
          : null,            // For teams or no assignment, use null
        assigned_to_type: task.assigned_to_type
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
