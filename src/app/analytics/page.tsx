"use client"

import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Analytics" 
        icon={BarChart3}
        iconClass="icon-analytics"
      />
      {/* Content will go here */}
    </div>
  )
}
