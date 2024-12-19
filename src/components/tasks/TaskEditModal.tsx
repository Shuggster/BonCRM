import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TaskAssignment } from './TaskAssignment';
import { taskService } from '@/lib/services/taskService';

interface TaskEditModalProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export function TaskEditModal({ task, onUpdate, onClose }: TaskEditModalProps) {
  // ... existing state and handlers ...

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        {/* Existing form fields */}
        
        {/* Add Assignment field before the Group field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Assigned To
          </label>
          <TaskAssignment
            taskId={task.id}
            currentAssignee={task.assigned_to}
            onAssign={(userId) => {
              // Update local task state with new assignee
              setTask(prev => ({ ...prev, assigned_to: userId }));
            }}
          />
        </div>

        {/* Group field and other existing fields */}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-600 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update Task
          </button>
        </div>
      </div>
    </div>
  );
} 