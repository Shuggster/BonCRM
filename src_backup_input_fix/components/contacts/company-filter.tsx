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

type ActiveFilter = 
  | { type: 'industry'; value: string; label: string }
  | { type: 'location'; value: string }
  | { type: 'department'; value: string }

interface CompanyFilterProps {
  selectedIndustry: string | null
  onIndustryChange: (industryId: string | null) => void
  industries: Array<{ id: string; name: string }>
  selectedLocation: string | null
  onLocationChange: (location: string | null) => void
  selectedDepartment: string | null
  onDepartmentChange: (department: string | null) => void
}

const DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Engineering',
  'Product',
  'Design',
  'Customer Success',
  'Support',
  'Finance',
  'HR',
  'Operations',
  'Legal'
]

export function CompanyFilter({
  selectedIndustry,
  onIndustryChange,
  industries,
  selectedLocation,
  onLocationChange,
  selectedDepartment,
  onDepartmentChange
}: CompanyFilterProps) {
  // Count active filters
  const activeFilters: ActiveFilter[] = [
    ...(selectedIndustry ? [{
      type: 'industry' as const,
      value: selectedIndustry,
      label: industries.find(i => i.id === selectedIndustry)?.name || ''
    }] : []),
    ...(selectedLocation ? [{ type: 'location' as const, value: selectedLocation }] : []),
    ...(selectedDepartment ? [{ type: 'department' as const, value: selectedDepartment }] : [])
  ]

  // Clear all company filters
  const clearAllFilters = () => {
    onIndustryChange(null)
    onLocationChange(null)
    onDepartmentChange(null)
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
            Company {activeFilters.length > 0 && `(${activeFilters.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {/* Industry Section */}
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Industry</div>
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedIndustry && "bg-blue-500/20 text-blue-400"
            )}
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

          {/* Department Section */}
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Department</div>
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedDepartment && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onDepartmentChange(null)}
          >
            All Departments
          </DropdownMenuItem>
          {DEPARTMENTS.map((department) => (
            <DropdownMenuItem
              key={department}
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                selectedDepartment === department && "bg-blue-500/20 text-blue-400"
              )}
              onClick={() => onDepartmentChange(department)}
            >
              {department}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-white/[0.08] my-2" />

          {/* Location Section */}
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Location</div>
          <DropdownMenuItem 
            className={cn(
              "text-white/70 hover:bg-white/10 hover:text-white",
              !selectedLocation && "bg-blue-500/20 text-blue-400"
            )}
            onClick={() => onLocationChange(null)}
          >
            All Locations
          </DropdownMenuItem>
          {/* We'll populate this dynamically from the contacts data */}
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
              {filter.type === 'industry' && 'Industry: '}
              {filter.type === 'location' && 'Location: '}
              {filter.type === 'department' && 'Department: '}
              {filter.type === 'industry' ? filter.label : formatFilterValue(filter.value)}
              <button
                onClick={() => {
                  if (filter.type === 'industry') onIndustryChange(null)
                  if (filter.type === 'location') onLocationChange(null)
                  if (filter.type === 'department') onDepartmentChange(null)
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