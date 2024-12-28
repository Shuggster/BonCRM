import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeadSource } from "@/types"

interface LeadSourceFilterProps {
  selectedSource: LeadSource | null
  onSourceChange: (source: LeadSource | null) => void
}

const LEAD_SOURCES: Array<{ value: LeadSource; label: string }> = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'other', label: 'Other' }
]

export function LeadSourceFilter({ selectedSource, onSourceChange }: LeadSourceFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={selectedSource ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          {selectedSource ? LEAD_SOURCES.find(s => s.value === selectedSource)?.label : 'Lead Source'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black border border-white/10">
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onSourceChange(null)}
        >
          All Sources
        </DropdownMenuItem>
        {LEAD_SOURCES.map((source) => (
          <DropdownMenuItem
            key={source.value}
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onSourceChange(source.value)}
          >
            {source.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 