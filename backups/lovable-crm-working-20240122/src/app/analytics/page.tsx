"use client"

import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        heading="Analytics"
        description="View your business metrics and insights"
        icon={<div className="icon-analytics"><BarChart3 className="h-6 w-6" /></div>}
      />
      {/* Content will go here */}
    </div>
  )
}
