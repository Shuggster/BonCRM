"use client"

import { Target } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function LeadsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Leads" 
        icon={Target}
        iconClass="icon-leads"
      />
      {/* Content will go here */}
    </div>
  )
}
