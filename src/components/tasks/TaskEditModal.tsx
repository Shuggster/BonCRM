// TEST COMMENT - MODAL 1
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TaskAssignment } from './TaskAssignment';
import { taskService } from '@/lib/services/taskService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Label, Input, Textarea, Button } from '@/components/ui';

interface TaskEditModalProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export function TaskEditModal({ task, onUpdate, onClose }: TaskEditModalProps) {
  const { data: session } = useSession();
  const [localTask, setLocalTask] = useState(task);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedTask = await taskService.updateTask(localTask);
      onUpdate(updatedTask);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-8 py-6 border-b border-white/10">
          <DialogTitle className="text-xl font-medium">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6">
          <div className="grid grid-cols-[2fr,1.5fr,1fr] gap-8">
            {/* Left Column - Main Details */}
            <div className="space-y-6">
              {/* Title & Description */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={localTask.title}
                  onChange={(e) => setLocalTask(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-[#1C2333] border-white/10 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={localTask.description}
                  onChange={(e) => setLocalTask(prev => ({ ...prev, description: e.target.value }))}
                  className="h-32 bg-[#1C2333] border-white/10 focus:border-blue-500"
                />
              </div>

              {/* Assignment */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Assigned To</Label>
                <TaskAssignment
                  taskId={task.id}
                  currentAssignee={localTask.assigned_to}
                  onAssign={(userId) => {
                    setLocalTask(prev => ({ ...prev, assigned_to: userId }));
                  }}
                />
              </div>
            </div>

            {/* Middle Column - Status & Priority */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-col gap-2">
                  {['todo', 'in-progress', 'completed'].map((status) => (
                    <Button
                      key={status}
                      type="button"
                      onClick={() => setLocalTask(prev => ({ ...prev, status }))}
                      variant={localTask.status === status ? 'default' : 'outline'}
                      className={cn(
                        "justify-start py-2.5 capitalize",
                        localTask.status === status ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/10 hover:bg-white/5'
                      )}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="flex flex-col gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <Button
                      key={priority}
                      type="button"
                      onClick={() => setLocalTask(prev => ({ ...prev, priority }))}
                      variant={localTask.priority === priority ? 'default' : 'outline'}
                      className={cn(
                        "justify-start py-2.5 capitalize",
                        localTask.priority === priority ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/10 hover:bg-white/5'
                      )}
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 mt-auto border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/10 hover:bg-white/5 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="border-l border-white/10 pl-8">
              <h3 className="text-lg font-medium mb-4">Comments</h3>
              {session && <TaskComments taskId={task.id} session={session} />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}