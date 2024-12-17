"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus, ListTodo } from "lucide-react"
import { TaskList } from "@/components/tasks/task-list"
import { TaskFilters } from "@/components/tasks/task-filters"
import { TaskModal } from '@/components/tasks/task-modal'
import { taskService } from '@/lib/supabase/services/tasks'
import { Task } from "@/types/tasks"
import { Session } from '@supabase/supabase-js'

interface TasksClientProps {
  session: Session
}

export function TasksClient({ session }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [showTaskModal, setShowTaskModal] = useState(false)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks(session)
        setTasks(data)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
    loadTasks()
  }, [session])

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await taskService.createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session)
      setTasks([newTask, ...tasks])
      setShowTaskModal(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return
    try {
      const updatedTask = await taskService.updateTask({
        ...selectedTask,
        ...taskData
      }, session)
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      setShowTaskModal(false)
      setSelectedTask(undefined)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  return (
    <div className="h-full bg-[#030711]">
      <div className="container mx-auto max-w-7xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <PageHeader 
              heading="Tasks"
              description="Manage your tasks and to-dos"
              icon={<ListTodo className="h-6 w-6" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button 
              className="gap-2" 
              onClick={() => setShowTaskModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            <div className="bg-[#0F1629]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl p-4">
              <h3 className="font-medium mb-4">Filters</h3>
              <TaskFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                priority={priority}
                onPriorityChange={setPriority}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-gradient-to-br from-[#0F1629]/50 via-[#0F1629]/30 to-[#030711]/50 
                          backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl p-6">
              {/* Task List */}
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No tasks yet. Create your first task to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <TaskList 
                      tasks={tasks} 
                      onTaskClick={(task) => {
                        setSelectedTask(task)
                        setShowTaskModal(true)
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(undefined)
        }}
        onSave={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
      />
    </div>
  )
}