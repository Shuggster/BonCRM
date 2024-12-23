"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { CalendarEvent } from "@/types/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { Search } from "lucide-react"

interface EventSearchProps {
  value: string
  onChange: (value: string) => void
  events?: CalendarEvent[]
}

export function EventSearch({ value, onChange, events = [] }: EventSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const suggestions = value ? events
    .filter(event => 
      event.title.toLowerCase().includes(value.toLowerCase()) ||
      event.description?.toLowerCase().includes(value.toLowerCase()) ||
      event.category?.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5) : []

  useEffect(() => {
    setSelectedIndex(-1)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex].title)
          setIsFocused(false)
          inputRef.current?.blur()
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsFocused(false)
        inputRef.current?.blur()
        break
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const getCategoryStyle = (category?: string) => {
    const defaultCategory = EVENT_CATEGORIES['default']
    if (!category || !(category in EVENT_CATEGORIES)) {
      return defaultCategory
    }
    return EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES]
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search events..."
          className="bg-white/5 pl-9"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {isFocused && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[#0F1629] border border-white/10 rounded-md shadow-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto"
        >
          {suggestions.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "px-3 py-2 cursor-pointer",
                index === selectedIndex ? "bg-white/10" : "hover:bg-white/5",
                "transition-colors duration-200"
              )}
              onClick={() => {
                onChange(event.title)
                setIsFocused(false)
              }}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getCategoryStyle(event.category).bgClass
                )} />
                <div className="font-medium">{event.title}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                <span>{format(event.start, 'MMM d, h:mm a')}</span>
                {event.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5">
                    {getCategoryStyle(event.category).label}
                  </span>
                )}
              </div>
              {event.description && (
                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
