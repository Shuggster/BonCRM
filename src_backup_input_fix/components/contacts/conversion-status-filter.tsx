import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConversionStatus } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ConversionStatusFilterProps {
  selectedStatus: ConversionStatus | null
  onStatusChange: (status: ConversionStatus | null) => void
}

const CONVERSION_STATUSES: Array<{ value: ConversionStatus; label: string }> = [
  { value: 'lead', label: 'Lead' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'customer', label: 'Customer' },
  { value: 'lost', label: 'Lost' }
]

export function ConversionStatusFilter({
  selectedStatus,
  onStatusChange
}: ConversionStatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={selectedStatus ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            {selectedStatus ? CONVERSION_STATUSES.find(s => s.value === selectedStatus)?.label : 'Conversion Status'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedStatus && "bg-purple-500/20 text-purple-400"
            )}
            onClick={() => onStatusChange(null)}
          >
            All Statuses
          </DropdownMenuItem>
          {CONVERSION_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status.value}
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                selectedStatus === status.value && "bg-purple-500/20 text-purple-400"
              )}
              onClick={() => onStatusChange(status.value)}
            >
              {status.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filter */}
      {selectedStatus && (
        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {CONVERSION_STATUSES.find(s => s.value === selectedStatus)?.label}
          <button
            onClick={() => onStatusChange(null)}
            className="ml-1 hover:text-purple-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
} 