"use client"

import { Users } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function ContactsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Contacts" 
        icon={Users}
        iconClass="icon-contacts"
      />
      {/* Content will go here */}
    </div>
  )
}
