import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Industry {
  id: string
  name: string
}

interface IndustryFilterProps {
  selectedIndustry: string | null
  onIndustryChange: (industryId: string | null) => void
  industries: Industry[]
}

export function IndustryFilter({ selectedIndustry, onIndustryChange, industries }: IndustryFilterProps) {
  const selectedIndustryName = industries.find(i => i.id === selectedIndustry)?.name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={selectedIndustry ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          {selectedIndustryName || 'Industry'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black border border-white/10">
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onIndustryChange(null)}
        >
          All Industries
        </DropdownMenuItem>
        {industries.map((industry) => (
          <DropdownMenuItem
            key={industry.id}
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onIndustryChange(industry.id)}
          >
            {industry.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 