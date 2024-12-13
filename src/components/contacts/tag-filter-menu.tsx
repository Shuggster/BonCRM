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
}

export const TagFilterMenu = forwardRef<{ refreshTags: () => void }, TagFilterMenuProps>(
  ({ onTagSelect, onOpenTagStats, onManageTags }, ref) => {
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('OR')

    const fetchTags = async () => {
      try {
        // Get distinct tag names with their counts
        const { data: tagData, error: tagsError } = await supabase
          .from('contact_tags')
          .select('name')
          .order('name')

        if (tagsError) {
          console.error('Error fetching tags:', tagsError.message)
          setTags([])
          return
        }

        // Count occurrences of each tag name
        const tagCounts = tagData?.reduce((acc: { [key: string]: number }, { name }) => {
          acc[name] = (acc[name] || 0) + 1
          return acc
        }, {})

        // Convert to array and sort by count
        const sortedTags = Object.entries(tagCounts || {})
          .map(([name, count]) => ({
            id: name,
            name,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            count: count || 0
          }))
          .sort((a, b) => b.count - a.count)

        setTags(sortedTags)
      } catch (error: any) {
        console.error('Error fetching tags:', error?.message || 'Unknown error')
        setTags([]) // Set empty array to prevent undefined errors
      }
    }

    useEffect(() => {
      fetchTags()
    }, [])

    useImperativeHandle(ref, () => ({
      refreshTags: fetchTags
    }))

    const handleTagClick = async (tagName: string) => {
      try {
        if (selectedTags.includes(tagName)) {
          setSelectedTags(selectedTags.filter(t => t !== tagName))
        } else {
          setSelectedTags([...selectedTags, tagName])
        }
      } catch (error: any) {
        console.error('Error updating selected tags:', error?.message || 'Unknown error')
      }
    }

    useEffect(() => {
      onTagSelect(selectedTags)
    }, [selectedTags, onTagSelect])

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={selectedTags.length > 0 ? "default" : "outline"}
            className={`
              transition-all duration-200
              ${selectedTags.length > 0 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-accent hover:text-accent-foreground"
              }
            `}
          >
            <Tags className="mr-2 h-4 w-4" />
            {selectedTags.length > 0 ? `${selectedTags.length} Tags` : "Filter Tags"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filter by Tags</span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-auto px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
              >
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {selectedTags.length > 1 && (
            <>
              <div className="px-2 py-1.5 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterMode === 'AND'}
                    onChange={() => {
                      const newMode = filterMode === 'AND' ? 'OR' : 'AND'
                      setFilterMode(newMode)
                      onTagSelect(selectedTags)
                    }}
                    className="h-4 w-4 rounded border-input bg-background"
                  />
                  <span>Match all tags (AND)</span>
                </label>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <div className="max-h-[300px] overflow-y-auto">
            {tags.map(tag => (
              <DropdownMenuItem
                key={tag.id}
                onSelect={(e) => {
                  e.preventDefault()
                  handleTagClick(tag.id)
                }}
                className="flex items-center justify-between hover:bg-accent focus:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-input bg-background"
                  />
                  <span
                    className="px-2 py-1 rounded-full text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tag.count}
                </span>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={onOpenTagStats}
            className="hover:bg-accent focus:bg-accent"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Tag Statistics
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={onManageTags}
            className="hover:bg-accent focus:bg-accent"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Tags
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

TagFilterMenu.displayName = 'TagFilterMenu'
