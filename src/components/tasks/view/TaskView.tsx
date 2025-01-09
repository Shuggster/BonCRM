import { Calendar, CheckSquare, Clock, Tag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/tasks'

interface TaskViewProps {
  task: Task
  section: 'upper' | 'lower'
  onClose: () => void
  onEdit?: (task: Task) => Promise<Task>
}

export function TaskView({ task, section, onClose, onEdit }: TaskViewProps) {
  return (
    <div className="h-full flex flex-col rounded-b-2xl">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Upper Section */}
        <motion.div
          key="task-upper"
          className="flex-none"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              {/* Header */}
              <div className="p-6 pb-0">
                <h2 className="text-2xl font-semibold text-white">{task.title}</h2>
              </div>

              <Card
                title="Basic Information"
                icon={<CheckSquare className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white/70">Description</div>
                    <div className="text-white/90 whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Lower Section */}
        <motion.div
          key="task-lower"
          className="flex-1 min-h-0"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <Card
                title="Scheduling"
                icon={<Clock className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-white/70 mb-2">Status</div>
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      task.status === 'completed' && "bg-green-500/10 text-green-500",
                      task.status === 'in-progress' && "bg-blue-500/10 text-blue-500",
                      task.status === 'todo' && "bg-white/10 text-white/90"
                    )}>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'Completed'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-white/70 mb-2">Assigned To</div>
                    {task.assigned_user ? (
                      <div className="text-white/90">
                        {task.assigned_user.name || task.assigned_user.email}
                      </div>
                    ) : (
                      <span className="text-white/60">Unassigned</span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 