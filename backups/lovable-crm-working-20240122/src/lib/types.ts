export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
} 