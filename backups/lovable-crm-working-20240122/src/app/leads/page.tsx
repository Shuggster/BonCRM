"use client"

import { Target } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function LeadsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        heading="Leads"
        description="Manage your sales leads and opportunities"
        icon={<div className="icon-leads"><Target className="h-6 w-6" /></div>}
      />
      {/* Content will go here */}
    </div>
  )
}
