import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LeadStatus, LeadSource } from "@/types"

type ActiveFilter = 
  | { type: 'status'; value: LeadStatus }
  | { type: 'source'; value: LeadSource }
  | { type: 'conversion'; value: 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' }

interface LeadFilterProps {
  selectedLeadStatus: LeadStatus | null
  onLeadStatusChange: (status: LeadStatus | null) => void
  selectedLeadSource: LeadSource | null
  onLeadSourceChange: (source: LeadSource | null) => void
}

export function LeadFilter({
  selectedLeadStatus,
  onLeadStatusChange,
  selectedLeadSource,
  onLeadSourceChange,
}: LeadFilterProps) {
  // Count active filters
  const activeFilters: ActiveFilter[] = [
    ...(selectedLeadStatus ? [{ type: 'status' as const, value: selectedLeadStatus }] : []),
    ...(selectedLeadSource ? [{ type: 'source' as const, value: selectedLeadSource }] : []),
  ]

  // Clear all lead filters
  const clearAllFilters = () => {
    onLeadStatusChange(null)
    onLeadSourceChange(null)
  }

  // Format filter value for display
  const formatFilterValue = (value: string) => {
    return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={activeFilters.length > 0 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Lead {activeFilters.length > 0 && `(${activeFilters.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {/* Lead Status Section */}
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Lead Status</div>
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedLeadStatus && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onLeadStatusChange(null)}
          >
            All Statuses
          </DropdownMenuItem>
          {['new', 'contacted', 'qualified', 'unqualified', 'proposal'].map((status) => (
            <DropdownMenuItem
              key={status}
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                selectedLeadStatus === status && "bg-blue-500/20 text-blue-400"
              )}
              onClick={() => onLeadStatusChange(status as LeadStatus)}
            >
              {formatFilterValue(status)}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-white/[0.08] my-2" />

          {/* Lead Source Section */}
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Lead Source</div>
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedLeadSource && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onLeadSourceChange(null)}
          >
            All Sources
          </DropdownMenuItem>
          {['website', 'referral', 'social_media', 'email', 'other'].map((source) => (
            <DropdownMenuItem
              key={source}
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                selectedLeadSource === source && "bg-blue-500/20 text-blue-400"
              )}
              onClick={() => onLeadSourceChange(source as LeadSource)}
            >
              {formatFilterValue(source)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <div
              key={filter.type + filter.value}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
            >
              {filter.type === 'status' && 'Status: '}
              {filter.type === 'source' && 'Source: '}
              {formatFilterValue(filter.value)}
              <button
                onClick={() => {
                  if (filter.type === 'status') onLeadStatusChange(null)
                  if (filter.type === 'source') onLeadSourceChange(null)
                }}
                className="ml-1 hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={clearAllFilters}
              className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:text-blue-300"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  )
} 