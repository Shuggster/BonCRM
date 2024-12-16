"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { CalendarEvent } from "@/types/calendar"
import { format } from "date-fns"

interface EventSearchProps {
  value: string
  onChange: (value: string) => void
  events?: CalendarEvent[]
}

export function EventSearch({ value, onChange, events = [] }: EventSearchProps) {
  const [isFocused, setIsFocused] = useState(false)

  const suggestions = value ? events
    .filter(event => 
      event.title.toLowerCase().includes(value.toLowerCase()) ||
      event.description?.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5) : []

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events..."
        className="bg-white/5"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1629] border border-white/10 rounded-md shadow-lg overflow-hidden z-50">
          {suggestions.map((event) => (
            <div
              key={event.id}
              className="px-3 py-2 hover:bg-white/5 cursor-pointer"
              onClick={() => {
                onChange(event.title)
                setIsFocused(false)
              }}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">
                {format(event.start, 'MMM d, h:mm a')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
