"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X, Filter, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export type FilterPreset = {
  id: string
  name: string
  filters: TaskFilters
}

export type TaskFilters = {
  search: string
  statuses: string[]
  priorities: string[]
  groups: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  assignedToMe: boolean
  hasComments: boolean
  isOverdue: boolean
}

interface AdvancedFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  groups: { id: string; name: string; color: string }[]
  presets?: FilterPreset[]
  onSavePreset?: (preset: Omit<FilterPreset, 'id'>) => void
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  groups,
  presets = [],
  onSavePreset
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presetName, setPresetName] = useState("")

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority]
    onFiltersChange({ ...filters, priorities: newPriorities })
  }

  const handleGroupToggle = (groupId: string) => {
    const newGroups = filters.groups.includes(groupId)
      ? filters.groups.filter(g => g !== groupId)
      : [...filters.groups, groupId]
    onFiltersChange({ ...filters, groups: newGroups })
  }

  const handleSavePreset = () => {
    if (!presetName.trim() || !onSavePreset) return
    onSavePreset({
      name: presetName.trim(),
      filters: { ...filters }
    })
    setPresetName("")
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      statuses: [],
      priorities: [],
      groups: [],
      dateRange: {},
      assignedToMe: false,
      hasComments: false,
      isOverdue: false
    })
  }

  const activeFiltersCount = [
    filters.search,
    ...filters.statuses,
    ...filters.priorities,
    ...filters.groups,
    filters.dateRange.from,
    filters.dateRange.to,
    filters.assignedToMe,
    filters.hasComments,
    filters.isOverdue
  ].filter(Boolean).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
        >
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal lg:hidden"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-4" align="start">
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Tasks</Label>
            <Input
              placeholder="Search in title and description..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="h-8"
            />
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {['todo', 'in-progress', 'completed'].map(status => (
                <Button
                  key={status}
                  variant={filters.statuses.includes(status) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusToggle(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex flex-wrap gap-2">
              {['low', 'medium', 'high'].map(priority => (
                <Button
                  key={priority}
                  variant={filters.priorities.includes(priority) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePriorityToggle(priority)}
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* Group Filters */}
          <div className="space-y-2">
            <Label>Groups</Label>
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <Button
                  key={group.id}
                  variant={filters.groups.includes(group.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <div
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, "PPP")
                    ) : (
                      <span>From date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, from: date ?? undefined }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, "PPP")
                    ) : (
                      <span>To date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, to: date ?? undefined }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-2">
            <Label>Additional Filters</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.assignedToMe ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, assignedToMe: !filters.assignedToMe })}
              >
                Assigned to me
              </Button>
              <Button
                variant={filters.hasComments ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, hasComments: !filters.hasComments })}
              >
                Has comments
              </Button>
              <Button
                variant={filters.isOverdue ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ ...filters, isOverdue: !filters.isOverdue })}
              >
                Overdue
              </Button>
            </div>
          </div>

          {/* Filter Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Filters</Label>
              <Select
                onValueChange={(value) => {
                  const preset = presets.find(p => p.id === value)
                  if (preset) {
                    onFiltersChange(preset.filters)
                  }
                }}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select a saved filter" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Save New Preset */}
          {onSavePreset && (
            <div className="flex gap-2">
              <Input
                placeholder="Filter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
