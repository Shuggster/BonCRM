'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { useTaskSplitView } from '@/components/tasks/new/hooks/useTaskSplitView'
import { Task } from '@/types/tasks'
import { TaskView } from '@/components/tasks/view/TaskView'
import { Tasks } from '@/components/tasks/new/Tasks'
import { useSession } from 'next-auth/react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { setContentAndShow, hide } = useSplitViewStore()
  const { showTaskOverview } = useTaskSplitView()
  const { data: session } = useSession()

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        setTasks(Array.isArray(data) ? data : [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setTasks([])
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchTasks()
    }
  }, [session])

  // Show task overview when tasks are loaded
  useEffect(() => {
    if (!loading && tasks) {
      showTaskOverview(tasks, loading)
    }
  }, [loading, tasks, showTaskOverview])

  const handleCreateTask = async (task: Task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const newTask = await response.json()
      setTasks(prevTasks => [...prevTasks, newTask])
      hide()
      showTaskOverview([...tasks, newTask], false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()
      setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? updatedTask : t))
      hide()
      showTaskOverview(tasks.map(t => t.id === task.id ? updatedTask : t), false)
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))
      hide()
      showTaskOverview(tasks.filter(t => t.id !== taskId), false)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  if (!session) {
    return <div>Please sign in to view tasks</div>
  }

  if (loading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="h-full">
      <Tasks
        tasks={tasks}
        isLoading={loading}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        currentUserId={session.user.id}
        onViewTask={(task) => {
          setSelectedTask(task)
          const topContent = (
            <motion.div
              key={task.id}
              className="h-full"
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
              <TaskView 
                task={task}
                section="upper"
                onClose={() => {
                  hide()
                  setSelectedTask(null)
                }}
                onEdit={handleUpdateTask}
              />
            </motion.div>
          )

          const bottomContent = (
            <motion.div
              key={`${task.id}-bottom`}
              className="h-full"
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
              <TaskView 
                task={task}
                section="lower"
                onClose={() => {
                  hide()
                  setSelectedTask(null)
                }}
                onEdit={handleUpdateTask}
              />
            </motion.div>
          )

          setContentAndShow(topContent, bottomContent, task.id)
        }}
      />
    </div>
  )
}
