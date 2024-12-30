'use client'

import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DueDateOption = 'today' | 'this-week' | 'this-month' | 'overdue' | 'no-date'

interface DueDateFilterProps {
  selectedDueDate: DueDateOption | null
  onDueDateChange: (dueDate: DueDateOption | null) => void
}

const DUE_DATE_OPTIONS: { value: DueDateOption; label: string }[] = [
  { value: 'today', label: 'Due Today' },
  { value: 'this-week', label: 'Due This Week' },
  { value: 'this-month', label: 'Due This Month' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'no-date', label: 'No Due Date' }
]

export function DueDateFilter({ selectedDueDate, onDueDateChange }: DueDateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Due Date
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Filter by Due Date</div>
          {DUE_DATE_OPTIONS.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onDueDateChange(value)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedDueDate && (
        <Button 
          size="sm"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
          onClick={() => onDueDateChange(null)}
        >
          Due: {DUE_DATE_OPTIONS.find(opt => opt.value === selectedDueDate)?.label}
          <X className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
} 