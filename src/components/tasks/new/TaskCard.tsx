'use client'

import { motion } from 'framer-motion'
import type { Task } from '@/types/tasks'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <motion.button
      variants={{
        hidden: { 
          opacity: 0, 
          x: 20,
          transition: {
            duration: 0.2
          }
        },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration: 0.4,
            ease: [0.32, 0.72, 0, 1]
          }
        }
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-white">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-zinc-400 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded-full text-xs capitalize
            ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs capitalize
            ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
              'bg-orange-500/20 text-orange-400'}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>
    </motion.button>
  )
} 