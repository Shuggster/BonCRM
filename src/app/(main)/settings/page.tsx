"use client"

import { Settings } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Settings" 
        icon={Settings}
        iconClass="icon-settings"
      />
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        {/* Add settings content here */}
      </div>
    </div>
  )
}
