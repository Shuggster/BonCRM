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
import { supabase } from '@/lib/supabase'

interface Tag {
  id: string
  name: string
  color: string
  count?: number
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

    const fetchTags = async () => {
      try {
        // Get all tags
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('id, name, color')
          .order('name')

        if (tagsError) {
          console.error('Error fetching tags:', tagsError.message)
          setTags([])
          return
        }

        // Get counts for each tag from contacts
        const tagsWithCounts = await Promise.all(
          (tags || []).map(async (tag) => {
            const { count, error: countError } = await supabase
              .from('contacts')
              .select('id', { count: 'exact', head: true })
              .contains('tags', [tag.id])

            if (countError) {
              console.error('Error getting count for tag:', tag.name, countError.message)
              return { ...tag, count: 0 }
            }

            return { ...tag, count: count || 0 }
          })
        )

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
            className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-1000"
          >
            <Tags className="h-4 w-4" />
            {selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'Filter by Tags'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-[#0F1629] border border-white/10">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-sm font-medium">Filter by Tags</span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagSelect([])}
                className="h-auto py-0.5 px-2 text-xs hover:bg-white/5 text-blue-400 hover:text-blue-300"
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
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5"
              >
                <span className="text-sm text-gray-400">Filter Mode:</span>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  {filterMode}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
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
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-gray-200">{tag.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{tag.count}</span>
                  {selectedTags.includes(tag.id) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            onSelect={() => onOpenTagStats()}
            className="px-3 py-2 hover:bg-white/5"
          >
            <BarChart2 className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-sm">Tag Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => onManageTags()}
            className="px-3 py-2 hover:bg-white/5"
          >
            <Settings className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-sm">Manage Tags</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
