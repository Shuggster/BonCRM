'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskList } from './TaskList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import type { Task } from '@/types/tasks'
import { TaskFormProvider, type TaskFormData } from './TaskFormContext'
import { useTaskFormSections } from './SimpleTaskForm'

interface SplitFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TaskFormData>
}

function SplitForm({ onSubmit, onCancel, initialData }: SplitFormProps) {
  const sections = useTaskFormSections({ onCancel, initialData })

  return (
    <TaskFormProvider onSubmit={onSubmit} initialData={initialData}>
      <div className="h-[50%]">
        <motion.div 
          className="h-full"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}>
            <sections.TopSection />
          </div>
        </motion.div>
      </div>

      <div className="h-[50%]">
        <motion.div
          className="h-full" 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}>
            <sections.BottomSection />
          </div>
        </motion.div>
      </div>
    </TaskFormProvider>
  )
}

interface TasksProps {
  tasks: Task[]
  isLoading: boolean
  onCreateTask: (data: TaskFormData) => Promise<void>
  onUpdateTask?: (task: Task) => Promise<void>
}

export function Tasks({ tasks, isLoading, onCreateTask, onUpdateTask }: TasksProps) {
  const { setContent, show, hide } = useSplitViewStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleEditTask = (task: Task) => {
    if (onUpdateTask) {
      hide()
      
      const initialFormData: Partial<TaskFormData> = {
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date
      }

      setTimeout(() => {
        const handleSubmit = async (formData: TaskFormData) => {
          await onUpdateTask({
            id: task.id,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            due_date: formData.due_date,
            status: task.status,
            task_group_id: task.task_group_id,
            user_id: task.user_id,
            assigned_to: task.assigned_to,
            created_at: task.created_at,
            updated_at: new Date().toISOString()
          })
          hide()
          setSelectedTask(null)
        }

        setContent(
          <SplitForm
            onSubmit={handleSubmit}
            onCancel={() => {
              hide()
              setSelectedTask(null)
            }}
            initialData={initialFormData}
          />,
          null
        )
        show()
      }, 100)
    }
  }

  const handleCreateClick = () => {
    hide()
    
    setTimeout(() => {
      setContent(
        <SplitForm
          onSubmit={async (formData) => {
            await onCreateTask(formData)
            hide()
          }}
          onCancel={() => hide()}
        />,
        null
      )
      show()
    }, 100)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background pointer-events-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border pointer-events-auto">
        <div className="flex items-center gap-3 pointer-events-auto">
          <h1 className="text-xl font-semibold text-foreground pointer-events-auto">All Tasks</h1>
        </div>
        
        <div className="flex items-center gap-6 pointer-events-auto">
          <Button 
            onClick={handleCreateClick}
            className="flex items-center gap-2 pointer-events-auto"
          >
            <Plus className="w-4 h-4 pointer-events-auto" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 no-scrollbar pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="list-container"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 1.2,
                  ease: [0.32, 0.72, 0, 1]
                }
              }
            }}
          >
            {isLoading ? (
              <div className="text-muted-foreground text-center mt-8 pointer-events-auto">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-muted-foreground text-center mt-8 pointer-events-auto">
                No tasks yet. Click "Create Task" to add one.
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onEditClick={handleEditTask}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 