import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { TaskAssignment } from './TaskAssignment';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types';
import { useState } from 'react'

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const { data: session } = useSession();

  const handleAssign = async (userId: string) => {
    if (!session) return;
    
    try {
      const updatedTask = await taskService.assignTask(
        task.id, 
        userId || null, 
        session
      );
      onUpdate(updatedTask);
    } catch (error) {
      console.error('Failed to assign task:', error);
      // Add appropriate error handling/notification
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      {/* Existing task card content */}
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Assigned To
        </label>
        <TaskAssignment
          taskId={task.id}
          currentAssignee={task.assigned_to}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
} 