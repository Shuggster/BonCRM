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

    console.log('Updating task with data:', { taskId, taskData });

    const response = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating task:', error);
      throw new Error(error.message || 'Failed to update task');
    }

    const data = await response.json();
    return data;
  }
}; 