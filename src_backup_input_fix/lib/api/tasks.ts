import type { Task } from '@/types/tasks'

const tasks: Task[] = [
  {
    id: '1',
    title: 'Review client proposal',
    description: 'Review and provide feedback on the new client proposal document',
    status: 'in-progress',
    priority: 'high',
    due_date: '2024-02-15',
    task_group_id: '1',
    user_id: '1',
    assigned_to: '1',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Update website content',
    description: 'Update the company website with new product features and pricing',
    status: 'todo',
    priority: 'medium',
    due_date: '2024-02-20',
    task_group_id: '1',
    user_id: '1',
    assigned_to: '2',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Schedule team meeting',
    description: 'Schedule a team meeting to discuss Q1 goals and objectives',
    status: 'completed',
    priority: 'low',
    due_date: '2024-02-10',
    task_group_id: '1',
    user_id: '1',
    assigned_to: '3',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
]

export async function getTasks(): Promise<Task[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return tasks
} 