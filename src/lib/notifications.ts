import { supabase } from "@/lib/supabase"
import { Task } from "@/types/tasks"

async function createNotification({
  user_id,
  type,
  message,
  entity_type,
  entity_id
}: {
  user_id: string
  type: string
  message: string
  entity_type: string
  entity_id: string
}) {
  return await supabase
    .from('notifications')
    .insert({
      user_id,
      type,
      message,
      entity_type,
      entity_id
    })
}

export async function notifyAssignment(task: Task) {
  if (task.assigned_to.type === 'team') {
    // Fetch team members
    const { data: members } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', task.assigned_to.id);

    // Create notifications for all team members
    await Promise.all(members.map(member => 
      createNotification({
        user_id: member.user_id,
        type: 'task_assignment',
        message: `New task assigned to your team: ${task.title}`,
        entity_type: 'task',
        entity_id: task.id
      })
    ));
  } else {
    // Single user notification
    await createNotification({
      user_id: task.assigned_to.id,
      type: 'task_assignment',
      message: `Task assigned to you: ${task.title}`,
      entity_type: 'task',
      entity_id: task.id
    });
  }
} 