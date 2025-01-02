'use client'

import { useState, useCallback, useEffect } from 'react'
import { TaskView } from '@/components/tasks/new/TaskView'
import { SimpleTaskForm } from '@/components/tasks/new/SimpleTaskForm'
import { Tasks } from '@/components/tasks/new/Tasks'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { TaskFormProvider } from '@/components/tasks/new/TaskFormContext'
import { TaskOverview } from '@/components/tasks/new/TaskOverview'
import type { Task } from '@/types/tasks'
import type { TaskFormData } from '@/components/tasks/new/TaskFormContext'
import { Button } from '@/components/ui/button'
import { BarChart3, CheckSquare, Clock, ArrowUpRight, ArrowRight, Plus, Filter, LayoutGrid } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function TasksPage() {
  const { setContentAndShow, hide } = useSplitViewStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const supabase = createClientComponentClient();
  const { data: session } = useSession();
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const setupInitialContent = () => {
    const topContent = (
      <div className="h-full">
        <motion.div 
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
          <TaskOverview 
            tasks={tasks}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
          />
        </motion.div>
      </div>
    );

    const bottomContent = (
      <div className="h-full">
        <motion.div 
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
          <TaskOverview 
            tasks={tasks}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
          />
        </motion.div>
      </div>
    );

    setContentAndShow(topContent, bottomContent, 'tasks-initial');
  };

  // Set up initial split view content
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      setupInitialContent()
    }
  }, [loading, tasks])

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
          task_group_id: data.task_group_id,
          assigned_to: data.assigned_to,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
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
    if (!session?.user?.id) return

    try {
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
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
        .single()

      if (error) {
        console.error('Error updating task:', error)
        throw error
      }

      if (updatedTask) {
        // Update the task in the list
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
        return updatedTask
      }
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!session?.user?.id) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }

      // Remove the task from the list
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const handleViewTask = (task: Task) => {
    hide();
    setSelectedTask(task);
    
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
            onClose={hide}
            onEdit={() => handleEditTask(task)}
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
            onClose={hide}
            onEdit={() => handleEditTask(task)}
          />
        </motion.div>
      );

      setContentAndShow(topContent, bottomContent, task.id);
    }, 100);
  };

  const handleEditTask = async (task: Task) => {
            hide();
    setSelectedTask(task);
    
    setTimeout(() => {
      const formData: Partial<TaskFormData> = {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        due_date: task.due_date,
        task_group_id: task.task_group_id,
        status: task.status,
        assigned_to: task.assigned_to
      };

      const topContent = (
        <TaskFormProvider 
          onSubmit={async (data) => {
            try {
              const { error } = await supabase
                .from('tasks')
                .update(data)
                .eq('id', task.id);

              if (error) throw error;
              
              await fetchTasks();
              handleViewTask(task);
            } catch (error) {
              console.error('Error updating task:', error);
            }
          }}
          onClose={() => handleViewTask(task)}
        >
          <SimpleTaskForm 
            onSubmit={async (data) => {
              try {
                const { error } = await supabase
                  .from('tasks')
                  .update(data)
                  .eq('id', task.id);

                if (error) throw error;
                
                await fetchTasks();
                handleViewTask(task);
              } catch (error) {
                console.error('Error updating task:', error);
              }
            }}
            onCancel={() => handleViewTask(task)}
            initialData={formData}
          />
        </TaskFormProvider>
      );

      setContentAndShow(topContent, null, `edit-task-${task.id}`);
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      <Tasks
        tasks={tasks}
        isLoading={loading}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onViewTask={handleViewTask}
        onEditTask={handleViewTask}
        currentUserId={session?.user?.id || ''}
        setupInitialContent={setupInitialContent}
      />
    </div>
  );
}
