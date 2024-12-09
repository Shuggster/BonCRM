"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function CalendarPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Calendar" 
        icon={CalendarIcon}
        iconClass="icon-calendar"
      />
      {/* Content will go here */}
    </div>
  )
}
