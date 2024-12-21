"use client"

import { useState, useEffect, useMemo } from 'react'
import { Session } from '@supabase/supabase-js'
import { Task, TaskFilters, TaskFilterPreset } from '@/types/tasks'
import { TaskGroup } from '@/lib/supabase/services/task-groups'
import { taskService } from '@/lib/supabase/services/tasks'
import { taskGroupService } from '@/lib/supabase/services/task-groups'
import { taskFilterPresetService } from '@/lib/supabase/services/task-filter-presets'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ListTodo, Plus, FolderPlus, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { TaskList } from '@/components/tasks/task-list'
import { TaskModal } from '@/components/tasks/task-modal'
import { GroupModal } from '@/components/tasks/group-modal'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TasksClientProps {
  session: Session
}

const sortOptions = [
  {
    label: 'Created (Newest)',
    value: 'created-desc',
    compareFn: (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  },
  {
    label: 'Created (Oldest)',
    value: 'created-asc',
    compareFn: (a: Task, b: Task) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  },
  {
    label: 'Due Date (Earliest)',
    value: 'due-asc',
    compareFn: (a: Task, b: Task) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  },
  {
    label: 'Due Date (Latest)',
    value: 'due-desc',
    compareFn: (a: Task, b: Task) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  },
  {
    label: 'Priority (High to Low)',
    value: 'priority-desc',
    compareFn: (a: Task, b: Task) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  },
  {
    label: 'Priority (Low to High)',
    value: 'priority-asc',
    compareFn: (a: Task, b: Task) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
  },
  {
    label: 'Title (A-Z)',
    value: 'title-asc',
    compareFn: (a: Task, b: Task) => a.title.localeCompare(b.title)
  },
  {
    label: 'Title (Z-A)',
    value: 'title-desc',
    compareFn: (a: Task, b: Task) => b.title.localeCompare(a.title)
  }
];

export function TasksClient({ session }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [users, setUsers] = useState<{ id: string, name: string }[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | undefined>()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [sortBy, setSortBy] = useState<string>('created-desc')
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    statuses: [],
    priorities: [],
    groups: [],
    dateRange: {},
    assignedToMe: false,
    hasComments: false,
    isOverdue: false
  })
  const [filterPresets, setFilterPresets] = useState<TaskFilterPreset[]>([])

  useEffect(() => {
    const loadTeamsAndGroups = async () => {
      try {
        const [teamsResponse, groupsResponse, usersResponse] = await Promise.all([
          supabase.from('teams').select('id, name, department'),
          taskGroupService.getGroups(session),
          supabase.from('users').select('id, name')
        ])

        if (teamsResponse.error) throw teamsResponse.error
        if (usersResponse.error) throw usersResponse.error
        
        setGroups(groupsResponse)
        setUsers(usersResponse.data || [])
      } catch (error) {
        console.error('Failed to load teams/groups/users:', error)
        toast.error('Failed to load teams/groups/users')
      }
    }
    loadTeamsAndGroups()
  }, [session])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks(session)
        setTasks(data)
      } catch (error) {
        console.error('Failed to load tasks:', error)
        toast.error('Failed to load tasks')
      }
    }
    loadTasks()
  }, [session])

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await taskService.createTask({
        ...taskData,
        assigned_to: taskData.assigned_to,
      } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session)
      setTasks([newTask, ...tasks])
      setShowTaskModal(false)
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return
    try {
      const updatedTask = await taskService.updateTask({
        ...selectedTask,
        ...taskData,
        assigned_to: taskData.assigned_to,
      }, session)
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      setShowTaskModal(false)
      setSelectedTask(undefined)
      toast.success('Task updated successfully')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleCreateGroup = async (group: Partial<TaskGroup>) => {
    try {
      const newGroup = await taskGroupService.createGroup({
        name: group.name || '',
        color: group.color || '#000000',
        description: group.description
      }, session)
      setGroups([...groups, newGroup])
      setShowGroupModal(false)
      toast.success('Group created successfully')
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group')
    }
  }

  const handleUpdateGroup = async (group: Partial<TaskGroup>) => {
    if (!selectedGroup) return
    try {
      const updatedGroup = await taskGroupService.updateGroup({
        ...selectedGroup,
        name: group.name || selectedGroup.name,
        color: group.color || selectedGroup.color,
        description: group.description
      }, session)
      setGroups(groups.map(g => 
        g.id === updatedGroup.id ? updatedGroup : g
      ))
      setShowGroupModal(false)
      setSelectedGroup(undefined)
      toast.success('Group updated successfully')
    } catch (error) {
      console.error('Failed to update group:', error)
      toast.error('Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await taskGroupService.deleteGroup(groupId, session)
      setGroups(groups.filter(group => group.id !== groupId))
      toast.success('Group deleted successfully')
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
    }
  }

  const handleSavePreset = async (preset: Omit<TaskFilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPreset = await taskFilterPresetService.createPreset(preset, session)
      setFilterPresets([newPreset, ...filterPresets])
      toast.success('Filter preset saved successfully')
    } catch (error) {
      console.error('Failed to save filter preset:', error)
      toast.error('Failed to save filter preset')
    }
  }

  const handleDeleteTask = async (task: Task) => {
    try {
      await taskService.deleteTask(task.id, session)
      setTasks(tasks.filter(t => t.id !== task.id))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleDuplicateTask = async (task: Task) => {
    try {
      const { id, createdAt, updatedAt, ...taskData } = task
      const newTask = await taskService.createTask({
        ...taskData,
        title: `${taskData.title} (Copy)`,
      }, session)
      setTasks([newTask, ...tasks])
      toast.success('Task duplicated successfully')
    } catch (error) {
      console.error('Failed to duplicate task:', error)
      toast.error('Failed to duplicate task')
    }
  }

  const handleStatusChange = async (task: Task, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      const updatedTask = await taskService.updateTask({
        ...task,
        status: newStatus
      }, session)
      setTasks(tasks.map(t => 
        t.id === updatedTask.id ? updatedTask : t
      ))
      toast.success('Task status updated')
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error('Failed to update task status')
    }
  }

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch = filters.search === "" || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(task.status);

      const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(task.priority);

      const matchesGroup = filters.groups.length === 0 || filters.groups.includes(task.taskGroupId || "");

      const matchesDateRange = (() => {
        if (!filters.dateRange.from && !filters.dateRange.to) return true;
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
        
        if (fromDate && toDate) {
          return dueDate >= fromDate && dueDate <= toDate;
        }
        if (fromDate) {
          return dueDate >= fromDate;
        }
        if (toDate) {
          return dueDate <= toDate;
        }
        return true;
      })();

      const matchesAssigned = !filters.assignedToMe || task.assigned_to === session.user.id;
      const matchesComments = !filters.hasComments || (task.comments && task.comments.length > 0);
      const matchesOverdue = !filters.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date());

      return matchesSearch && matchesStatus && matchesPriority && matchesGroup && 
             matchesDateRange && matchesAssigned && matchesComments && matchesOverdue;
    });

    const sortOption = sortOptions.find(option => option.value === sortBy);
    if (sortOption) {
      return [...filtered].sort(sortOption.compareFn);
    }
    return filtered;
  }, [tasks, filters, sortBy, session.user.id]);

  return (
    <div className="h-full bg-[#030711]">
      <TooltipProvider>
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
            <div className="flex-shrink-0 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "gap-2 px-4 py-2 h-10",
                      "bg-[#1C2333] text-gray-300 hover:text-gray-200",
                      "border-white/10 hover:bg-[#1C2333]/80",
                      "transition-all duration-200"
                    )}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-[#0F1629] border-white/10 text-gray-100"
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        "flex items-center gap-2 text-sm px-2 py-1.5",
                        "text-gray-300 hover:text-gray-100 cursor-pointer",
                        sortBy === option.value && "bg-white/5"
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline"
                className={cn(
                  "gap-2 px-4 py-2 h-10",
                  "bg-[#1C2333] text-gray-300 hover:text-gray-200",
                  "border-white/10 hover:bg-[#1C2333]/80",
                  "transition-all duration-200"
                )}
                onClick={() => setShowGroupModal(true)}
              >
                <FolderPlus className="h-4 w-4" />
                New Group
              </Button>
              <Button 
                className={cn(
                  "gap-2 px-4 py-2 h-10",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "transition-all duration-200"
                )}
                onClick={() => setShowTaskModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            groups={groups}
            users={users}
            onTaskClick={(task) => {
              setSelectedTask(task)
              setShowTaskModal(true)
            }}
            onTaskDelete={handleDeleteTask}
            onTaskDuplicate={handleDuplicateTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </TooltipProvider>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(undefined)
        }}
        onSave={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
        groups={groups}
        session={session}
      />

      {/* Group Modal */}
      <GroupModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false)
          setSelectedGroup(undefined)
        }}
        onSave={selectedGroup ? handleUpdateGroup : handleCreateGroup}
        group={selectedGroup}
      />
    </div>
  )
}