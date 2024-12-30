'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle2, ListTodo, Loader2,  // Status icons
  Flag, Timer, CheckSquare, MessageSquare, Clock  // Priority icons
} from 'lucide-react'
import type { Task } from '@/types/tasks'

interface TaskListProps {
  tasks: Task[]
  onEditClick: (task: Task) => void
}

export function TaskList({ tasks, onEditClick }: TaskListProps) {
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

  // Helper function to get the priority icon
  const getPriorityIcon = (priority: string) => {
    const color = priority === 'high' ? 'text-red-400' :
                 priority === 'medium' ? 'text-orange-400' :
                 'text-green-400'
                 
    switch (priority) {
      case 'high':
        return <Flag className={`w-5 h-5 ${color}`} />
      case 'medium':
        return <Timer className={`w-5 h-5 ${color}`} />
      default:
        return <CheckSquare className={`w-5 h-5 ${color}`} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Group tasks by status */}
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
                  onClick={() => onEditClick(task)}
                  className="group px-6 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center">
                      {getStatusIcon(task.status, task.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{task.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-orange-500/20 text-orange-400'}`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {task.description && (
                          <p className="text-sm text-zinc-400 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(task.priority)}
                              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.task_groups && (
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: task.task_groups.color }}
                              />
                              <span>{task.task_groups.name}</span>
                            </div>
                          )}
                          {task.assigned_user && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                                {task.assigned_user.name?.[0] || task.assigned_user.email?.[0]}
                              </div>
                              <span>{task.assigned_user.name || task.assigned_user.email}</span>
                            </div>
                          )}
                          {task.comments_count > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{task.comments_count}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
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
  )
} 