"use client"

import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CalendarView } from "@/components/calendar/calendar-view"
import { CategoryFilter } from "@/components/calendar/category-filter"
import { EventSearch } from "@/components/calendar/event-search"
import { EventModal } from "@/components/calendar/event-modal"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CalendarEvent } from "@/types/calendar"

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showEventModal, setShowEventModal] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      start: new Date(2024, 11, 16, 10, 0),
      end: new Date(2024, 11, 16, 11, 0),
      category: 'meeting'
    },
    {
      id: '2',
      title: 'Client Call',
      description: 'Project review with client',
      start: new Date(2024, 11, 16, 14, 0),
      end: new Date(2024, 11, 16, 15, 0),
      category: 'call'
    }
  ])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        ...eventData,
        start: eventData.start!,
        end: eventData.end!
      }

      if (selectedEvent) {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? { ...event, ...newEvent } : event
        ))
      } else {
        setEvents([...events, newEvent])
      }

      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(event.category || 'default')
    
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full bg-[#030711]">
      <div className="container mx-auto max-w-7xl p-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <PageHeader 
              heading="Calendar"
              description="Manage your schedule and appointments"
              icon={<CalendarIcon className="h-6 w-6" />}
            />
          </div>
          <div className="flex-shrink-0 ml-4">
            <Button onClick={() => setShowEventModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            <div className="bg-[#0F1629]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl p-4 space-y-6">
              <EventSearch value={searchQuery} onChange={setSearchQuery} />
              <CategoryFilter 
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-gradient-to-br from-[#0F1629]/50 via-[#0F1629]/30 to-[#030711]/50 
                          backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl overflow-hidden">
              <CalendarView events={filteredEvents} onEventClick={handleEventClick} />
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
      />
    </div>
  )
}
