"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-[#111111] rounded-lg border border-white/10", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-[#111111] border-white/10 p-0 hover:bg-white/5 hover:text-white"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 gap-1 text-center mb-1",
        head_cell: "text-white/60 text-xs font-normal",
        row: "grid grid-cols-7 gap-1 mt-1",
        cell: "text-center p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-white/5",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-white/90 hover:bg-white/5 hover:text-white aria-selected:opacity-100"
        ),
        day_selected:
          "bg-white/10 text-white hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white",
        day_today: "bg-white/5 text-white",
        day_outside: "text-white/40 opacity-50",
        day_disabled: "text-white/40 opacity-50",
        day_range_middle:
          "aria-selected:bg-white/5 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 