import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface SortMenuProps {
  onSortChange: (direction: 'asc' | 'desc') => void
  sortDirection: 'asc' | 'desc'
}

export function SortMenu({ onSortChange, sortDirection }: SortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-[#111111] hover:bg-[#1a1a1a] text-white border-white/[0.08]"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          A-Z {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black border border-white/10">
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onSortChange('asc')}
        >
          A to Z
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => onSortChange('desc')}
        >
          Z to A
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 