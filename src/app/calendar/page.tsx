"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import Sidebar from '@/components/layout/Sidebar'

export default function CalendarPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-8">
          <PageHeader 
            heading="Calendar"
            description="Manage your schedule and appointments"
            icon={<div className="icon-calendar"><CalendarIcon className="h-6 w-6" /></div>}
          />
          {/* Calendar content will go here */}
        </div>
      </main>
    </div>
  )
}
