import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LeadStatus, LeadSource } from "@/types"

interface FilterMenuProps {
  selectedLeadStatus: LeadStatus | null
  onLeadStatusChange: (status: LeadStatus | null) => void
  selectedLeadSource: LeadSource | null
  onLeadSourceChange: (source: LeadSource | null) => void
  selectedIndustry: string | null
  onIndustryChange: (industryId: string | null) => void
  industries: Array<{ id: string; name: string }>
  selectedConversionStatus: 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' | null
  onConversionStatusChange: (status: 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' | null) => void
}

export function FilterMenu({ 
  selectedLeadStatus,
  onLeadStatusChange,
  selectedLeadSource,
  onLeadSourceChange,
  selectedIndustry,
  onIndustryChange,
  industries,
  selectedConversionStatus,
  onConversionStatusChange
}: FilterMenuProps) {
  // Count active filters
  const activeFilterCount = [
    selectedLeadStatus,
    selectedLeadSource,
    selectedIndustry,
    selectedConversionStatus
  ].filter(Boolean).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={activeFilterCount > 0 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter by {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
        {/* Lead Status Section */}
        <div className="px-2 py-1.5 text-xs font-medium text-white/50">Lead Status</div>
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
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
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-white/[0.08] my-2" />

        {/* Lead Source Section */}
        <div className="px-2 py-1.5 text-xs font-medium text-white/50">Lead Source</div>
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
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
            {source.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-white/[0.08] my-2" />

        {/* Industry Section */}
        <div className="px-2 py-1.5 text-xs font-medium text-white/50">Industry</div>
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onIndustryChange(null)}
        >
          All Industries
        </DropdownMenuItem>
        {industries.map((industry) => (
          <DropdownMenuItem
            key={industry.id}
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              selectedIndustry === industry.id && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onIndustryChange(industry.id)}
          >
            {industry.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-white/[0.08] my-2" />

        {/* Conversion Status Section */}
        <div className="px-2 py-1.5 text-xs font-medium text-white/50">Conversion Status</div>
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onConversionStatusChange(null)}
        >
          All Statuses
        </DropdownMenuItem>
        {['lead', 'prospect', 'opportunity', 'customer', 'churned'].map((status) => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              selectedConversionStatus === status && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onConversionStatusChange(status as any)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 