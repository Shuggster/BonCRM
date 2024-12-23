"use client"

import { Building2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function CompaniesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Companies" 
        icon={Building2}
        iconClass="icon-companies"
      />
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        {/* Add company list/grid here */}
      </div>
    </div>
  )
}
