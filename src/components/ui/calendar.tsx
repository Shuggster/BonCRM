"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import "react-day-picker/dist/style.css"

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
      className={cn(
        "p-3 bg-[#111111] rounded-lg border border-white/10",
        "[&_button]:text-white",
        "[&_button:hover]:text-white",
        "[&_button:focus]:text-white",
        "[&_button>svg]:text-white",
        "[&_button>svg]:stroke-white",
        "[&_button>svg]:stroke-[2]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 p-0 opacity-100",
          "hover:bg-white/10",
          "focus:bg-white/10",
          "absolute top-1 flex items-center justify-center",
          "!text-white"
        ),
        nav_button_previous: "left-1",
        nav_button_next: "right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 gap-1",
        head_cell: "text-white/60 rounded-md w-8 font-normal text-[0.8rem]",
        row: "grid grid-cols-7 gap-1",
        cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-white/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-white aria-selected:opacity-100"
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
      modifiers={{
        today: new Date(),
      }}
      modifiersStyles={{
        today: {
          color: 'white'
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 