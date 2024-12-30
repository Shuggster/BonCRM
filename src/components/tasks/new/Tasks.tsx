'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskList } from './TaskList'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Search } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import type { Task } from '@/types/tasks'
import { TaskFormProvider, type TaskFormData } from './TaskFormContext'
import { SimpleTaskForm } from './SimpleTaskForm'
import { TaskView } from './TaskView'

interface SplitFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TaskFormData>
}

function SplitForm({ onSubmit, onCancel, initialData }: SplitFormProps) {
  return (
    <TaskFormProvider onSubmit={onSubmit} onClose={onCancel} initialData={initialData}>
      <SimpleTaskForm onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
    </TaskFormProvider>
  )
}

interface TasksProps {
  tasks: Task[]
  isLoading: boolean
  onCreateTask: (data: any) => Promise<void>
  onUpdateTask?: (task: Task) => Promise<void>
}

export function Tasks({ tasks, isLoading, onCreateTask, onUpdateTask }: TasksProps) {
  const { setContent, show, hide } = useSplitViewStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleEditTask = (task: Task) => {
    if (onUpdateTask) {
      hide()
      
      const initialFormData: Partial<TaskFormData> = {
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date,
        status: task.status,
        task_group_id: task.task_group_id,
        assigned_to: task.assigned_to
      }

      setTimeout(() => {
        setContent(
          <SplitForm
            onSubmit={async (formData) => {
              await onUpdateTask({
                id: task.id,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                due_date: formData.due_date,
                status: formData.status || task.status,
                task_group_id: formData.task_group_id || task.task_group_id,
                user_id: task.user_id,
                assigned_to: formData.assigned_to || task.assigned_to,
                created_at: task.created_at,
                updated_at: new Date().toISOString()
              })
              hide()
              setSelectedTask(null)
            }}
            onCancel={() => {
              hide()
              setSelectedTask(null)
            }}
            initialData={initialFormData}
          />,
          <TaskView 
            task={task}
            section="lower"
            onClose={() => {
              hide()
              setSelectedTask(null)
            }}
          />
        )
        show()
      }, 100)
    }
  }

  const handleViewTask = (task: Task) => {
    hide()
    
    setTimeout(() => {
      setContent(
        <TaskView 
          task={task}
          section="upper"
          onClose={() => {
            hide()
            setSelectedTask(null)
          }}
          onEdit={async (updatedTask) => {
            if (onUpdateTask) {
              await onUpdateTask({
                ...updatedTask,
                updated_at: new Date().toISOString()
              })
              // Update the view with the latest task data
              handleViewTask(updatedTask)
            }
          }}
        />,
        <TaskView 
          task={task}
          section="lower"
          onClose={() => {
            hide()
            setSelectedTask(null)
          }}
        />
      )
      show()
    }, 100)
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

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-black/20">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Tasks</h1>
          <div className="flex items-center gap-2">
            <div className="h-4 w-px bg-white/[0.08]" />
            <span className="text-sm text-zinc-400">{tasks.length} total</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-64 px-4 py-2 pl-10 bg-[#111111] border border-white/[0.08] rounded-lg text-white placeholder:text-white/40 focus:border-white/20"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button 
            onClick={() => {}}
            className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-blue-500" />
            Filter
          </Button>
          <Button 
            onClick={handleCreateClick}
            className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key="list-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            {isLoading ? (
              <div className="text-white/60 text-center mt-8">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-white/60 text-center mt-8">
                {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Click "Create Task" to add one.'}
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onEditClick={handleViewTask}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 