"use client"

import { Target } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function GoalsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader 
          heading="Goals"
          description="Track and manage your business objectives"
          icon={<div className="icon-goals"><Target className="h-6 w-6" /></div>}
        />
        {/* Goals content will go here */}
      </div>
    </main>
  )
}
