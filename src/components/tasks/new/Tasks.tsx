'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskList } from './TaskList'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Search, FolderKanban, X } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import type { Task, TaskGroup } from '@/types/tasks'
import { SimpleTaskForm } from './SimpleTaskForm'
import { TaskView } from './TaskView'
import { TaskFilters } from './TaskFilters'
import type { DueDateOption } from './DueDateFilter'
import type { AssignedToOption } from './AssignedToFilter'
import { getUsers } from '@/app/actions/users'
import { TaskGroupsManager } from './TaskGroupsManager'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { TaskFormData } from './TaskFormContext'
import { TaskFormProvider } from './TaskFormContext'

interface TasksProps {
  tasks: Task[]
  isLoading: boolean
  onCreateTask: (task: Task) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  currentUserId: string
  onViewTask: (task: Task) => void
}

export function Tasks({ 
  tasks: rawTasks = [], 
  isLoading, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask, 
  currentUserId, 
  onViewTask
}: TasksProps) {
  const { setContentAndShow, hide } = useSplitViewStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<{
    priority: 'high' | 'medium' | 'low' | null
    status: 'todo' | 'in-progress' | 'completed' | null
    dueDate: DueDateOption | null
    assignedTo: AssignedToOption | null
    group: string | null
  }>({
    priority: null,
    status: null,
    dueDate: null,
    assignedTo: null,
    group: null
  })

  // Ensure tasks is always an array
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];

  const refreshDashboard = useCallback(() => {
    hide();
  }, [hide]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const [showGroupsManager, setShowGroupsManager] = useState(false)
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers()
        setUsers(userList)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchTaskGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('task_groups')
          .select('*')
          .order('name')

        if (error) throw error
        setTaskGroups(data || [])
      } catch (error) {
        console.error('Error fetching task groups:', error)
      }
    }

    fetchTaskGroups()
  }, [])

  const handleTaskGroupsChange = () => {
    const fetchTaskGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('task_groups')
          .select('*')
          .order('name')

        if (error) throw error
        setTaskGroups(data || [])
      } catch (error) {
        console.error('Error fetching task groups:', error)
      }
    }

    fetchTaskGroups()
  }

  const handleEditTask = async (task: Task): Promise<Task> => {
    console.log('Tasks: handleEditTask called with task:', task);
    if (!onUpdateTask) {
      return task;
    }

    hide();
    setSelectedTask(task);
    
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
              console.log('Form submitted with data:', formData);
              const updatedTask: Task = {
                id: task.id,
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                due_date: formData.due_date || undefined,
                status: formData.status,
                task_group_id: formData.task_group_id,
                user_id: task.user_id,
                assigned_to: formData.assigned_to || undefined,
                created_at: task.created_at,
                updated_at: new Date().toISOString(),
                task_groups: task.task_groups
              };
              
              try {
                const result = await onUpdateTask(updatedTask);
                if (result) {
                  hide();
                  handleViewTask(result);
                }
              } catch (error) {
                console.error('Error updating task:', error);
              }
            }}
            onClose={() => handleViewTask(task)}
            initialData={{
              title: task.title,
              description: task.description || '',
              priority: task.priority || 'medium',
              due_date: task.due_date || null,
              status: task.status,
              task_group_id: task.task_group_id || null,
              assigned_to: task.assigned_to || null
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
            setSelectedTask(null);
          }}
        />
      </motion.div>
    );

    setContentAndShow(topContent, bottomContent, `${task.id}-edit`);
    return task;
  };

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
            onClose={() => {
              hide();
              setSelectedTask(null);
            }}
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
            onClose={() => {
              hide();
              setSelectedTask(null);
            }}
            onEdit={() => handleEditTask(task)}
          />
        </motion.div>
      );

      setContentAndShow(topContent, bottomContent, task.id);
    }, 100);
  };

  const handleCreateClick = useCallback(() => {
    if (!onCreateTask) return;
    
    hide();
    const topContent = (
      <motion.div
        key="create-task"
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
            onSubmit={async (data) => {
              try {
                await onCreateTask(data);
                hide();
              } catch (error) {
                console.error('Error creating task:', error);
              }
            }}
            onClose={hide}
            initialData={{
              title: '',
              description: '',
              priority: 'medium',
              due_date: null,
              status: 'todo',
              task_group_id: null,
              assigned_to: null
            }}
          >
            <SimpleTaskForm />
          </TaskFormProvider>
        </div>
      </motion.div>
    );

    setContentAndShow(topContent, null, 'create-task');
  }, [hide, onCreateTask, setContentAndShow]);

  const filteredTasks = tasks.filter(task => {
    if (!task) return false;  // Skip null or undefined tasks
    
    // Text search filter
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Priority filter
    const matchesPriority = !filters.priority || task.priority === filters.priority

    // Status filter
    const matchesStatus = !filters.status || task.status === filters.status

    // Due date filter
    const matchesDueDate = !filters.dueDate || (() => {
      if (!task.due_date) return filters.dueDate === 'no-date'
      
      const dueDate = new Date(task.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()))
      
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      switch (filters.dueDate) {
        case 'today':
          return dueDate >= today && dueDate < tomorrow
        case 'this-week':
          return dueDate >= today && dueDate <= weekEnd
        case 'this-month':
          return dueDate >= today && dueDate <= monthEnd
        case 'overdue':
          return dueDate < today
        case 'no-date':
          return false
        default:
          return true
      }
    })()

    // Assigned to filter
    const matchesAssignedTo = !filters.assignedTo || (() => {
      switch (filters.assignedTo) {
        case 'me':
          return task.assigned_to === currentUserId
        case 'unassigned':
          return !task.assigned_to
        default:
          return task.assigned_to === filters.assignedTo
      }
    })()

    return matchesSearch && matchesPriority && matchesStatus && matchesDueDate && matchesAssignedTo
  })

  const handleTaskDeleted = async (taskId: string) => {
    if (onDeleteTask) {
      await onDeleteTask(taskId)
    } else {
      // Fallback to page refresh if no callback provided
      window.location.reload()
    }
  }

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
              className="w-64 h-10 bg-[#1a1a1a] text-white rounded-lg pl-10 pr-4 border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/[0.08] placeholder-zinc-400"
              placeholder="Search tasks..."
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button
            onClick={() => setShowGroupsManager(true)}
            className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4" />
            Manage Groups
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

      <TaskFilters
        onFiltersChange={setFilters}
        currentUserId={currentUserId}
        users={users}
        tasks={tasks}
        onViewTask={onViewTask}
        onEditTask={handleEditTask}
        isLoading={isLoading}
      />

      {showGroupsManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/[0.08] w-[800px] max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Manage Task Groups</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGroupsManager(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <TaskGroupsManager
                taskGroups={taskGroups}
                onGroupsChange={handleTaskGroupsChange}
              />
            </div>
          </div>
        </div>
      )}

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
                onViewClick={handleViewTask}
                onEditClick={handleEditTask}
                onTaskDeleted={handleTaskDeleted}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 