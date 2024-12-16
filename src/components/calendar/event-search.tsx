"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { format } from "date-fns"
import { CalendarEvent } from "@/types/calendar"
import { cn } from "@/lib/utils"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface EventSearchProps {
  onSearch: (query: string) => void
  events: CalendarEvent[]
}

export function EventSearch({ onSearch, events }: EventSearchProps) {
  const [value, setValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedSearch = useDebounce(onSearch, 300)

  const suggestions = value ? events
    .filter(event => 
      event.title.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5) : []

  return (
    <div className="relative group">
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
        <Input
          type="text"
          placeholder="Search events..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            debouncedSearch(e.target.value)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-9 bg-white/5 border-white/10 hover:bg-white/10 
                   focus:bg-white/10 focus:ring-purple-500/20"
        />
      </motion.div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur 
                     rounded-lg border border-white/10 shadow-lg overflow-hidden"
          >
            {suggestions.map((event) => (
              <div
                key={event.id}
                className="p-2 hover:bg-white/5 cursor-pointer flex items-start gap-3"
                onClick={() => {
                  setValue(event.title)
                  onSearch(event.title)
                  setShowSuggestions(false)
                }}
              >
                <div 
                  className={cn(
                    "w-2 h-2 mt-2 rounded-full",
                    EVENT_CATEGORIES[event.category || 'default']?.bgClass
                  )}
                />
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.start, 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
