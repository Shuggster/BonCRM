import { create } from 'zustand'
import { Task } from '@/types/tasks'
import { supabase } from '@/lib/supabase/client'

interface TaskStore {
  tasks: Task[]
  fetchTasks: () => Promise<Task[]>
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  fetchTasks: async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    set({ tasks })
    return tasks
  }
})) 