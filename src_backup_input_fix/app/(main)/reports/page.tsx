"use client"

import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function ReportsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader 
          heading="Reports"
          description="View and analyze your business metrics"
          icon={<div className="icon-reports"><BarChart3 className="h-6 w-6" /></div>}
        />
        {/* Reports content will go here */}
      </div>
    </main>
  )
}
