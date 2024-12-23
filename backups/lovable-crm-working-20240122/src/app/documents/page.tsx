"use client"

import { FileText } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function DocumentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Documents" 
        icon={FileText}
        iconClass="icon-documents"
      />
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        {/* Add document list/grid here */}
      </div>
    </div>
  )
}
