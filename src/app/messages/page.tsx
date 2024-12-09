"use client"

import { MessageSquare } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function MessagesPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Messages" 
        icon={MessageSquare}
        iconClass="icon-messages"
      />
      {/* Content will go here */}
    </div>
  )
}
