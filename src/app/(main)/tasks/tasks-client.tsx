"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'
import { Tasks } from '@/components/tasks/new/Tasks'
import { motion } from 'framer-motion'
import { BarChart3, CheckSquare, Clock } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { Task } from '@/types/tasks'
import { useTaskSplitView } from '@/components/tasks/new/hooks/useTaskSplitView'
import { TaskView } from '@/components/tasks/new/TaskView'
import { TaskFormProvider } from '@/components/tasks/new/TaskFormContext'
import { SimpleTaskForm } from '@/components/tasks/new/SimpleTaskForm'

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#22c55e'
}

const STATUS_COLORS = {
  'todo': '#f97316',
  'in-progress': '#3b82f6',
  'completed': '#22c55e'
}

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { data: session } = useSession()
  const { hide, setContentAndShow } = useSplitViewStore()
  const { showTaskOverview } = useTaskSplitView()

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setTasks(data)
      }
      setIsLoading(false)
    }

    fetchTasks()
  }, [session?.user?.id])

  const handleCreateTask = async (data: any) => {
    if (!session?.user?.id) return

    try {
      const { data: createdTask, error } = await supabase
        .from('tasks')
        .insert([{
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: 'todo',
          due_date: data.dueDate,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      if (createdTask) {
        // Add new task to the beginning of the list
        setTasks(prev => [createdTask, ...prev])
        return createdTask
      }
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (task: Task) => {
    if (!session?.user?.id) {
      console.error('TasksClient: No user session');
      return;
    }

    console.log('TasksClient: Handling task update:', task);

    try {
      console.log('TasksClient: Sending update to Supabase');
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.due_date,
          task_group_id: task.task_group_id,
          assigned_to: task.assigned_to,
          updated_at: new Date().toISOString(),
          user_id: session.user.id
        })
        .eq('id', task.id)
        .select(`
          *,
          task_groups (
            id,
            name,
            color,
            description
          )
        `)
        .single()

      if (error) {
        console.error('TasksClient: Error updating task:', error);
        throw error;
      }

      if (!updatedTask) {
        console.error('TasksClient: No task returned from update');
        throw new Error('No task returned from update');
      }

      console.log('TasksClient: Task updated successfully:', updatedTask);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      
      return updatedTask;
    } catch (error) {
      console.error('TasksClient: Error in handleUpdateTask:', error);
      throw error;
    }
  }

  const handleViewTask = (task: Task) => {
    hide()
    setTimeout(() => {
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
              hide();
              showTaskOverview(tasks, isLoading);
            }}
            onEdit={handleEditTask}
          />
        </motion.div>
      );

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
              hide();
              showTaskOverview(tasks, isLoading);
            }}
            onEdit={handleEditTask}
          />
        </motion.div>
      );

      setContentAndShow(topContent, bottomContent, task.id);
    }, 300)
  }

  const handleEditTask = async (task: Task): Promise<Task> => {
    console.log('TasksClient: handleEditTask called with task:', task);
    hide();
    
    return new Promise((resolve, reject) => {
      console.log('TasksClient: Setting up edit form');
      const topContent = (
        <motion.div
          key={`${task.id}-edit-form`}
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
          <div className="h-full flex flex-col rounded-b-2xl">
            <TaskFormProvider
              onSubmit={async (formData) => {
                console.log('TasksClient: Form submitted with data:', formData);
                const updatedTask = {
                  ...task,
                  title: formData.title,
                  description: formData.description,
                  priority: formData.priority,
                  due_date: formData.due_date || task.due_date,
                  status: formData.status || task.status,
                  assigned_to: formData.assigned_to || task.assigned_to,
                  updated_at: new Date().toISOString()
                };
                try {
                  console.log('TasksClient: Calling handleUpdateTask with:', updatedTask);
                  const result = await handleUpdateTask(updatedTask);
                  console.log('TasksClient: Update successful:', result);
                  hide();
                  handleViewTask(result);
                  resolve(result);
                } catch (error) {
                  console.error('TasksClient: Error updating task:', error);
                  reject(error);
                }
              }}
              onClose={() => {
                console.log('TasksClient: Edit cancelled');
                handleViewTask(task);
                resolve(task);
              }}
              initialData={{
                title: task.title,
                description: task.description || '',
                priority: task.priority || 'medium',
                due_date: task.due_date,
                status: task.status,
                assigned_to: task.assigned_to
              }}
            >
              <SimpleTaskForm />
            </TaskFormProvider>
          </div>
        </motion.div>
      );

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
              hide();
              showTaskOverview(tasks, isLoading);
              resolve(task);
            }}
          />
        </motion.div>
      );

      console.log('TasksClient: Showing edit form');
      setContentAndShow(topContent, bottomContent, `${task.id}-edit`);
    });
  }

  return (
    <Tasks
      tasks={tasks}
      isLoading={isLoading}
      onCreateTask={handleCreateTask}
      onUpdateTask={handleUpdateTask}
      currentUserId={session?.user?.id || ''}
      onViewTask={handleViewTask}
      setupInitialContent={() => showTaskOverview(tasks, isLoading)}
    />
  )
} 