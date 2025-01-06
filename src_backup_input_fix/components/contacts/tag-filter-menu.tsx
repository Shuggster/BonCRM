"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tags, Plus, BarChart2, Settings } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  name: string
  color: string
  count?: number
}

interface TagRelation {
  tag_id: string
  count: number
}

interface TagFilterMenuProps {
  onTagSelect: (tagIds: string[]) => void
  onOpenTagStats: () => void
  onManageTags: () => void
  selectedTags?: string[]
  filterMode?: 'AND' | 'OR'
  onFilterModeChange?: () => void
}

export const TagFilterMenu = forwardRef<{ refreshTags: () => void }, TagFilterMenuProps>(
  ({ onTagSelect, onOpenTagStats, onManageTags, selectedTags = [], filterMode = 'OR', onFilterModeChange }, ref) => {
    const [tags, setTags] = useState<Tag[]>([])
    const supabase = createClientComponentClient()

    const fetchTags = async () => {
      try {
        // First fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('contact_tags')
          .select('id, name, color')
          .order('name')

        if (tagsError) throw tagsError

        // Then fetch all relations to count manually
        const { data: relationData, error: relationError } = await supabase
          .from('contact_tag_relations')
          .select('tag_id')

        if (relationError) throw relationError

        // Count tags manually
        const tagCounts = relationData.reduce((acc: Record<string, number>, rel) => {
          acc[rel.tag_id] = (acc[rel.tag_id] || 0) + 1
          return acc
        }, {})

        // Combine the data
        const tagsWithCounts = tagsData.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          count: tagCounts[tag.id] || 0
        }))

        setTags(tagsWithCounts)
      } catch (err) {
        console.error('Error:', err)
        setTags([])
      }
    }

    useEffect(() => {
      fetchTags()
    }, [])

    useImperativeHandle(ref, () => ({
      refreshTags: fetchTags
    }))

    const handleTagClick = (tagId: string) => {
      const newSelectedTags = selectedTags.includes(tagId)
        ? selectedTags.filter(t => t !== tagId)
        : [...selectedTags, tagId]
      onTagSelect(newSelectedTags)
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={selectedTags.length > 0 ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 h-10 px-4 animate-in fade-in slide-in-from-bottom-5 duration-1000",
              selectedTags.length > 0 ? "bg-blue-600 hover:bg-blue-700" : "border-white/10 hover:bg-white/5"
            )}
          >
            <Tags className="h-4 w-4" />
            {selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'Filter by Tags'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-64 bg-black border border-white/10 rounded-lg overflow-hidden"
        >
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03]">
            <span className="text-sm font-medium">Filter by Tags</span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagSelect([])}
                className="h-7 px-2 text-xs hover:bg-white/5 text-blue-400 hover:text-blue-300"
              >
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          
          {selectedTags.length > 0 && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  onFilterModeChange?.()
                }}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-sm text-white/60">Filter Mode</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#0F1629] text-blue-400 border border-white/[0.03]">
                  {filterMode}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.03]" />
            </>
          )}

          <div className="max-h-[300px] overflow-y-auto py-1">
            {tags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onSelect={(e) => {
                  e.preventDefault()
                  handleTagClick(tag.id)
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] cursor-pointer group",
                  selectedTags.includes(tag.id) && "bg-white/[0.01]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-white/[0.03]"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-white/90">{tag.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">{tag.count}</span>
                  {selectedTags.includes(tag.id) && (
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-white/[0.03]" />
          <DropdownMenuItem 
            onSelect={() => onOpenTagStats()}
            className="px-3 py-2 hover:bg-white/[0.02] cursor-pointer"
          >
            <BarChart2 className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/90">Tag Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => onManageTags()}
            className="px-3 py-2 hover:bg-white/[0.02] cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/90">Manage Tags</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
