'use client'

import { Bell } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function NotificationSettingsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Notification Preferences" 
        icon={Bell}
        iconClass="icon-settings"
      />
      {/* Content will go here */}
    </div>
  )
}
