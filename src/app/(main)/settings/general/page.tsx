'use client'

import { Settings } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function GeneralSettingsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="General Settings" 
        icon={Settings}
        iconClass="icon-settings"
      />
      {/* Content will go here */}
    </div>
  )
}
