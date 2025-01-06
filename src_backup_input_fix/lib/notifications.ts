import { supabase } from "@/lib/supabase"

export async function notifyAssignment({
  taskId,
  assignedTo,
  assignedBy,
  previousAssignee
}: {
  taskId: string
  assignedTo: { type: 'user' | 'team', id: string }
  assignedBy: string
  previousAssignee?: { type: 'user' | 'team', id: string }
}) {
  // Create notification
  const notification = {
    type: 'task_assignment',
    taskId,
    assignedTo,
    assignedBy,
    previousAssignee
  }

  return await supabase
    .from('notifications')
    .insert(notification)
} 