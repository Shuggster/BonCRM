"use client"

import { MessageSquare } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function MessagesPage() {
  return (
    <div className="p-6">
      <PageHeader 
        heading="Messages"
        description="View and manage your conversations"
        icon={<div className="icon-messages"><MessageSquare className="h-6 w-6" /></div>}
      />
      {/* Content will go here */}
    </div>
  )
}
