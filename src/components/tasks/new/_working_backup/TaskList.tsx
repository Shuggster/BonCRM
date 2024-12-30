'use client'

import { motion } from 'framer-motion'
import type { Task } from '@/types/tasks'

interface TaskListProps {
  tasks: Task[]
  onEditClick: (task: Task) => void
}

export function TaskList({ tasks, onEditClick }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onClick={() => onEditClick(task)}
          className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border cursor-pointer
            transition-colors hover:bg-zinc-800/50 border-white/[0.05]"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{task.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium
              ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                'bg-green-500/20 text-green-400'}`}
            >
              {task.priority}
            </div>
          </div>
          {task.description && (
            <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            {task.due_date && (
              <div className="text-xs text-zinc-400">
                Due {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
            <div className={`px-2 py-1 rounded-full text-xs
              ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-orange-500/20 text-orange-400'}`}
            >
              {task.status.replace('-', ' ')}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 