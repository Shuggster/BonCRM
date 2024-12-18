"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus, ListTodo, ArrowUpDown, FolderPlus } from "lucide-react"
import { TaskList } from "@/components/tasks/task-list"
import { AdvancedFilters, TaskFilters } from "@/components/tasks/advanced-filters"
import { TaskModal } from '@/components/tasks/task-modal'
import { GroupModal } from '@/components/tasks/group-modal'
import { taskService } from '@/lib/supabase/services/tasks'
import { taskGroupService, TaskGroup } from '@/lib/supabase/services/task-groups'
import { taskFilterPresetService, TaskFilterPreset } from '@/lib/supabase/services/task-filter-presets'
import { Task } from "@/types/tasks"
import { Session } from '@supabase/supabase-js'
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = {
  label: string;
  value: string;
  compareFn: (a: Task, b: Task) => number;
}

const sortOptions: SortOption[] = [
  {
    label: "Created (Newest)",
    value: "created-desc",
    compareFn: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  },
  {
    label: "Created (Oldest)",
    value: "created-asc",
    compareFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  },
  {
    label: "Due Date (Earliest)",
    value: "due-asc",
    compareFn: (a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  },
  {
    label: "Due Date (Latest)",
    value: "due-desc",
    compareFn: (a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  },
  {
    label: "Priority (High to Low)",
    value: "priority-desc",
    compareFn: (a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  },
  {
    label: "Priority (Low to High)",
    value: "priority-asc",
    compareFn: (a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
  }
];

interface TasksClientProps {
  session: Session
}

export function TasksClient({ session }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [filterPresets, setFilterPresets] = useState<TaskFilterPreset[]>([])
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    statuses: [],
    priorities: [],
    groups: [],
    dateRange: {},
    assignedToMe: false,
    hasComments: false,
    isOverdue: false
  })
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | undefined>()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [sortBy, setSortBy] = useState<string>("created-desc")

  useEffect(() => {
    if (!session?.user) {
      console.error('No session or user')
      return
    }
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

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await taskGroupService.getGroups(session)
        setGroups(data)
      } catch (error) {
        console.error('Failed to load groups:', error)
        toast.error('Failed to load groups')
      }
    }
    loadGroups()
  }, [session])

  useEffect(() => {
    const loadFilterPresets = async () => {
      try {
        console.log('Loading filter presets...')
        const data = await taskFilterPresetService.getPresets(session)
        console.log('Loaded presets:', data)
        setFilterPresets(data)
      } catch (error: any) {
        console.error('Failed to load filter presets:', error.message || error)
        toast.error(`Failed to load filter presets: ${error.message || 'Unknown error'}`)
      }
    }
    loadFilterPresets()
  }, [session])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    // First filter
    const filtered = tasks.filter(task => {
      // Search filter
      const matchesSearch = filters.search === "" || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      // Status filter
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(task.status);

      // Priority filter
      const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(task.priority);

      // Group filter
      const matchesGroup = filters.groups.length === 0 || filters.groups.includes(task.taskGroupId || "");

      // Date range filter
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

      // Additional filters
      const matchesAssigned = !filters.assignedToMe || task.assignedTo === session.user.id;
      const matchesComments = !filters.hasComments || (task.comments && task.comments.length > 0);
      const matchesOverdue = !filters.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date());

      // All filters must match
      return matchesSearch && matchesStatus && matchesPriority && matchesGroup && 
             matchesDateRange && matchesAssigned && matchesComments && matchesOverdue;
    });

    // Then sort
    const sortOption = sortOptions.find(option => option.value === sortBy);
    if (sortOption) {
      return [...filtered].sort(sortOption.compareFn);
    }
    return filtered;
  }, [tasks, filters, sortBy, session.user.id]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await taskService.createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session)
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
        ...taskData
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

  const handleCreateGroup = async (groupData: Partial<TaskGroup>) => {
    try {
      const newGroup = await taskGroupService.createGroup(groupData as Omit<TaskGroup, 'id' | 'created_at' | 'updated_at'>, session)
      setGroups([...groups, newGroup])
      setShowGroupModal(false)
      toast.success('Group created successfully')
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group')
    }
  }

  const handleUpdateGroup = async (groupData: Partial<TaskGroup>) => {
    if (!selectedGroup) return
    try {
      const updatedGroup = await taskGroupService.updateGroup({
        ...selectedGroup,
        ...groupData
      }, session)
      setGroups(groups.map(group => 
        group.id === updatedGroup.id ? updatedGroup : group
      ))
      setShowGroupModal(false)
      setSelectedGroup(undefined)
      toast.success('Group updated successfully')
    } catch (error) {
      console.error('Failed to update group:', error)
      toast.error('Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupToDelete: TaskGroup) => {
    try {
      await taskGroupService.deleteGroup(groupToDelete.id, session)
      setGroups(groups.filter(g => g.id !== groupToDelete.id))
      // Reset group filter if the deleted group was selected
      if (groupToDelete.id === filters.groups[0]) {
        setFilters({
          ...filters,
          groups: []
        })
      }
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

  const handleDeletePreset = async (presetId: string) => {
    try {
      await taskFilterPresetService.deletePreset(presetId, session)
      setFilterPresets(filterPresets.filter(p => p.id !== presetId))
      toast.success('Filter preset deleted successfully')
    } catch (error) {
      console.error('Failed to delete filter preset:', error)
      toast.error('Failed to delete filter preset')
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
          <div className="flex-shrink-0 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? "bg-accent" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline"
              className="gap-2" 
              onClick={() => setShowGroupModal(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New Group
            </Button>
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
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                groups={groups.map(g => ({
                  id: g.id,
                  name: g.name,
                  color: g.color
                }))}
                presets={filterPresets}
                onSavePreset={(preset) => handleSavePreset({
                  ...preset,
                  userId: session.user.id,
                  filters: filters
                })}
                onDeletePreset={handleDeletePreset}
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
                {filteredTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {tasks.length === 0 ? (
                      "No tasks yet. Create your first task to get started."
                    ) : (
                      "No tasks match your filters."
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <TaskList 
                      tasks={filteredTasks} 
                      onTaskClick={(task) => {
                        setSelectedTask(task)
                        setShowTaskModal(true)
                      }}
                      onTaskDelete={handleDeleteTask}
                      onTaskDuplicate={handleDuplicateTask}
                      onStatusChange={handleStatusChange}
                      groups={groups}
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
        groups={groups}
        session={session}
      />
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