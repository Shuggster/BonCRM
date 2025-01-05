import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface EventTypeFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
}

export function EventTypeFilter({ selectedType, onTypeChange }: EventTypeFilterProps) {
  const selectedTypeName = selectedType ? EVENT_CATEGORIES[selectedType as keyof typeof EVENT_CATEGORIES]?.label : null

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2",
              "border border-white/[0.08] hover:border-white/[0.15]",
              "bg-[#1a1a1a] hover:bg-[#222]"
            )}
          >
            <Filter className="w-4 h-4" />
            Event Type
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {Object.entries(EVENT_CATEGORIES).map(([type, data]) => (
            <DropdownMenuItem
              key={type}
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                "flex items-center gap-2"
              )}
              onClick={() => onTypeChange(type)}
            >
              <div className={cn("w-2 h-2 rounded-full", data.bgClass)} />
              {data.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedType && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2",
            "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          )}
          onClick={() => onTypeChange(null)}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            EVENT_CATEGORIES[selectedType as keyof typeof EVENT_CATEGORIES]?.bgClass
          )} />
          {selectedTypeName}
          <X className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  )
} 