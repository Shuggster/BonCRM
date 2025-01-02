"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { UserSession } from "@/types/session"
import { PageHeader } from "@/components/ui/page-header"
import { format, subMonths, addMonths, subWeeks, addWeeks, subDays, addDays, startOfWeek, endOfWeek } from "date-fns"

interface CalendarProps {
  session: UserSession
}

function getNavigationText(date: Date, viewType: string) {
  switch (viewType) {
    case 'month':
      return format(date, 'MMMM yyyy')
    case 'week':
      const weekStart = startOfWeek(date)
      const weekEnd = endOfWeek(date)
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy')
    default:
      return format(date, 'MMMM yyyy')
  }
}

export function Calendar({ session }: CalendarProps) {
  if (!session?.user) {
    return null
  }

  const [viewType, setViewType] = useState('month')
  const [currentDate, handleDateChange] = useState(new Date())

  return (
    <div className="container mx-auto max-w-7xl p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <PageHeader 
            heading="Calendar"
            description="Manage your schedule and appointments"
            icon={<CalendarIcon className="h-6 w-6" />}
          />
        </div>
        <div className="flex-shrink-0">
          <Button 
            className={cn(
              "gap-2 px-4 py-2 h-9",
              "bg-[#1a1a1a] hover:bg-[#222] text-white",
              "border border-white/[0.08]",
              "transition-all duration-200"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="bg-[#111111] rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex h-full w-full">
          {/* Column 2: Calendar Overview */}
          <div className="flex-1 border-r border-white/10">
            <div className="flex h-full flex-col">
              {/* Navigation Bar */}
              <div className="border-b border-white/[0.08] bg-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between px-6 py-4">
                  {/* Left side: View type buttons */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-2 bg-white/[0.03] rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('month')}
                        className={cn(
                          "text-zinc-400 hover:text-zinc-300 px-4 min-w-[90px]",
                          viewType === 'month' && "bg-white/10 text-zinc-200"
                        )}
                      >
                        Month
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('week')}
                        className={cn(
                          "text-zinc-400 hover:text-zinc-300 px-4 min-w-[90px]",
                          viewType === 'week' && "bg-white/10 text-zinc-200"
                        )}
                      >
                        Week
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewType('day')}
                        className={cn(
                          "text-zinc-400 hover:text-zinc-300 px-4 min-w-[90px]",
                          viewType === 'day' && "bg-white/10 text-zinc-200"
                        )}
                      >
                        Day
                      </Button>
                    </div>
                  </div>

                  {/* Center: Current period display */}
                  <div className="flex-1 flex justify-center ml-24">
                    <h2 className="text-lg font-semibold text-zinc-200">
                      {getNavigationText(currentDate, viewType)}
                    </h2>
                  </div>

                  {/* Right side: Navigation controls */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-1 bg-white/[0.03] rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          switch (viewType) {
                            case 'month':
                              handleDateChange(subMonths(currentDate, 1))
                              break
                            case 'week':
                              handleDateChange(subWeeks(currentDate, 1))
                              break
                            case 'day':
                              handleDateChange(subDays(currentDate, 1))
                              break
                          }
                        }}
                        className="hover:bg-white/10 px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateChange(new Date())}
                        className="hover:bg-white/10 px-3 min-w-[80px]"
                      >
                        Today
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          switch (viewType) {
                            case 'month':
                              handleDateChange(addMonths(currentDate, 1))
                              break
                            case 'week':
                              handleDateChange(addWeeks(currentDate, 1))
                              break
                            case 'day':
                              handleDateChange(addDays(currentDate, 1))
                              break
                          }
                        }}
                        className="hover:bg-white/10 px-3"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-4">
                  {/* Department filter */}
                  <div className="w-[200px]">
                    {/* Department dropdown will go here */}
                  </div>
                  {/* User filter */}
                  <div className="w-[200px]">
                    {/* User dropdown will go here */}
                  </div>
                </div>
              </div>

              {/* Main Calendar Area */}
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-7 gap-px bg-white/5">
                  {/* Calendar days and events will go here */}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Event Details */}
          <div className="w-[400px] border-l border-white/10">
            <div className="flex h-full flex-col">
              {/* Event details will go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 