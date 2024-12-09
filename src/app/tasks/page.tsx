"use client"

import { CheckSquare } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function TasksPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Tasks" 
        icon={CheckSquare}
        iconClass="icon-tasks"
      />
      {/* Content will go here */}
    </div>
  )
}
