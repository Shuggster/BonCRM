import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeadStatus } from "@/types"

interface LeadStatusFilterProps {
  selectedStatus: LeadStatus | null
  onStatusChange: (status: LeadStatus | null) => void
}

const LEAD_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'proposal', label: 'Proposal' }
]

export function LeadStatusFilter({ selectedStatus, onStatusChange }: LeadStatusFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={selectedStatus ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          {selectedStatus ? LEAD_STATUSES.find(s => s.value === selectedStatus)?.label : 'Lead Status'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black border border-white/10">
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onStatusChange(null)}
        >
          All Statuses
        </DropdownMenuItem>
        {LEAD_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status.value}
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onStatusChange(status.value)}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 