import { Session } from 'next-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

const supabase = createClientComponentClient<Database>();

export const taskService = {
  // ... existing methods ...

  async assignTask(taskId: string, userId: string | null, session: Session) {
    if (!session) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        assigned_to: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, taskData: Partial<Task>, session: Session) {
    if (!session) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date,
        group_id: taskData.group_id,
        assigned_to: taskData.assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 