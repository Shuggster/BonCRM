"use client"

import { FileUp } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import ContactImportTool from "@/components/admin/import/ContactImportTool"

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        heading="Import Data"
        description="Import contacts and other data from external sources"
        icon={FileUp}
      />
      
      <ContactImportTool />
    </div>
  )
} 