'use client'

import { DateRangeFilter, DateRangeType } from './DateRangeFilter'
import { StatusFilter, StatusType } from './StatusFilter'
import { PriorityFilter, PriorityType } from './PriorityFilter'
import { AssignmentFilter } from './AssignmentFilter'

interface DateRange {
  start: Date
  end: Date
}

interface CalendarFilterHeaderProps {
  dateRange: DateRangeType | null
  customDateRange: DateRange | null
  status: StatusType | null
  priority: PriorityType | null
  assignee: string | null
  onDateRangeChange: (range: DateRangeType | null) => void
  onCustomDateRangeChange: (range: DateRange | null) => void
  onStatusChange: (status: StatusType | null) => void
  onPriorityChange: (priority: PriorityType | null) => void
  onAssigneeChange: (assignee: string | null) => void
}

export function CalendarFilterHeader({
  dateRange,
  customDateRange,
  status,
  priority,
  assignee,
  onDateRangeChange,
  onCustomDateRangeChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange
}: CalendarFilterHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/[0.08]">
      <DateRangeFilter
        selectedRange={dateRange}
        customDateRange={customDateRange}
        onRangeChange={onDateRangeChange}
        onCustomRangeChange={onCustomDateRangeChange}
      />
      <StatusFilter
        selectedStatus={status}
        onStatusChange={onStatusChange}
      />
      <PriorityFilter
        selectedPriority={priority}
        onPriorityChange={onPriorityChange}
      />
      <AssignmentFilter
        selectedAssignee={assignee}
        onAssigneeChange={onAssigneeChange}
      />
    </div>
  )
} 