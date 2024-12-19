"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { TeamSelect } from "@/components/ui/team-select"

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
  group: string
  onGroupChange: (value: string) => void
  groups: TaskGroup[]
  assignedTo: {
    users: string[];
    teams: string[];
  };
  onChange: (filters: TaskFiltersProps) => void
}

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  group,
  onGroupChange,
  groups,
  assignedTo,
  onChange
}: TaskFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          value={status}
          onValueChange={onStatusChange}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="status-all" />
            <Label htmlFor="status-all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="todo" id="status-todo" />
            <Label htmlFor="status-todo">To Do</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="in-progress" id="status-in-progress" />
            <Label htmlFor="status-in-progress">In Progress</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="completed" id="status-completed" />
            <Label htmlFor="status-completed">Completed</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <RadioGroup
          value={priority}
          onValueChange={onPriorityChange}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="priority-all" />
            <Label htmlFor="priority-all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="priority-low" />
            <Label htmlFor="priority-low">Low</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="priority-medium" />
            <Label htmlFor="priority-medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="priority-high" />
            <Label htmlFor="priority-high">High</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Groups */}
      <div className="space-y-2">
        <Label>Group</Label>
        <RadioGroup
          value={group}
          onValueChange={onGroupChange}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="group-all" />
            <Label htmlFor="group-all">All Groups</Label>
          </div>
          {groups.map((g) => (
            <div key={g.id} className="flex items-center space-x-2">
              <RadioGroupItem value={g.id} id={`group-${g.id}`} />
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: g.color }}
                />
                <Label htmlFor={`group-${g.id}`}>{g.name}</Label>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Assigned To</h3>
        <TeamSelect 
          multiple 
          includeTeams 
          onChange={selection => {
            onChange({
              ...filters,
              assignedTo: selection
            });
          }} 
        />
      </div>
    </div>
  )
} 