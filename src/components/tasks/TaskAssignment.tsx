import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskAssignmentProps {
  taskId: string;
  currentAssignee?: string;
  onAssign: (userId: string) => void;
}

export function TaskAssignment({ taskId, currentAssignee, onAssign }: TaskAssignmentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function loadUsers() {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      setUsers(users || []);
      setLoading(false);
    }

    loadUsers();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="relative">
      <select
        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
        value={currentAssignee || ''}
        onChange={(e) => onAssign(e.target.value)}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email}
          </option>
        ))}
      </select>
    </div>
  );
} 