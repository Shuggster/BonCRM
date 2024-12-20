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
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filter by Tags</span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagSelect([])}
                className="h-auto py-0 px-1 text-xs hover:bg-transparent hover:text-blue-500"
              >
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {selectedTags.length > 0 && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  onFilterModeChange?.()
                }}
                className="flex items-center justify-between"
              >
                <span>Filter Mode:</span>
                <span className="text-sm font-medium">{filterMode}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
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

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onOpenTagStats()}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Tag Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onManageTags()}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Manage Tags</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
