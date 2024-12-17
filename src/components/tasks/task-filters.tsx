"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
}

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange
}: TaskFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-4">
        <Label>Status</Label>
        <RadioGroup
          value={status}
          onValueChange={onStatusChange}
          className="space-y-2"
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
            <RadioGroupItem value="in-progress" id="status-progress" />
            <Label htmlFor="status-progress">In Progress</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="completed" id="status-completed" />
            <Label htmlFor="status-completed">Completed</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Priority Filter */}
      <div className="space-y-4">
        <Label>Priority</Label>
        <RadioGroup
          value={priority}
          onValueChange={onPriorityChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="priority-all" />
            <Label htmlFor="priority-all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="priority-high" />
            <Label htmlFor="priority-high">High</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="priority-medium" />
            <Label htmlFor="priority-medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="priority-low" />
            <Label htmlFor="priority-low">Low</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
} 