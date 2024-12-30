'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle2, ListTodo, Loader2,  // Status icons
  Flag, Timer, CheckSquare, MessageSquare, Clock, MoreVertical,  // Priority icons
  Eye, Pencil, Trash2  // Menu icons
} from 'lucide-react'
import type { Task } from '@/types/tasks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { taskService } from '@/lib/supabase/services/tasks'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { DeleteTaskModal } from './DeleteTaskModal'

interface TaskListProps {
  tasks: Task[]
  onEditClick: (task: Task) => void
  onViewClick: (task: Task) => void
  onTaskDeleted: (taskId: string) => Promise<void>
}

export function TaskList({ tasks, onEditClick, onViewClick, onTaskDeleted }: TaskListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await onTaskDeleted(taskToDelete.id)
    }
  }

  // Helper function to get the status icon
  const getStatusIcon = (status: string, priority: string) => {
    const color = priority === 'high' ? 'text-red-400' :
                 priority === 'medium' ? 'text-orange-400' :
                 'text-green-400'
                 
    switch (status) {
      case 'completed':
        return <CheckCircle2 className={`w-5 h-5 ${color}`} />
      case 'in-progress':
        return <Loader2 className={`w-5 h-5 ${color}`} />
      default:
        return <ListTodo className={`w-5 h-5 ${color}`} />
    }
  }

  return (
    <>
      <div className="space-y-6">
        {['todo', 'in-progress', 'completed'].map((status) => {
          const statusTasks = tasks.filter(task => task.status === status)
          if (statusTasks.length === 0) return null

          return (
            <div key={status}>
              <div className="px-6 py-2 text-sm font-medium text-zinc-400 uppercase">
                {status.replace('-', ' ')}
              </div>
              <div className="space-y-1">
                {statusTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onViewClick(task)}
                    className="group px-6 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-center">
                      {/* Column 1: Task Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center shrink-0">
                          {getStatusIcon(task.status, task.priority)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-zinc-400 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Status & Priority */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'
                          )}>
                            {task.status.replace('-', ' ')}
                          </span>
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-sm text-zinc-400">
                              <Clock className="w-4 h-4" />
                              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Assignment & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {task.task_groups && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#111111] border border-white/[0.08]">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: task.task_groups.color }}
                              />
                              <span className="text-sm">{task.task_groups.name}</span>
                            </div>
                          )}
                          {task.assigned_user && (
                            <div className="flex items-center gap-1">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium">
                                {task.assigned_user.name?.[0] || task.assigned_user.email?.[0]}
                              </div>
                            </div>
                          )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="w-48 bg-[#1a1a1a] border border-white/[0.08]"
                            >
                              <DropdownMenuItem 
                                onClick={() => onViewClick(task)}
                                className="flex items-center gap-2 text-sm hover:bg-white/[0.02] cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                View Task
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onEditClick(task)}
                                className="flex items-center gap-2 text-sm hover:bg-white/[0.02] cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 text-sm text-red-400 hover:bg-white/[0.02] cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(task);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <DeleteTaskModal
        taskId={taskToDelete?.id || ''}
        taskTitle={taskToDelete?.title || ''}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
} 