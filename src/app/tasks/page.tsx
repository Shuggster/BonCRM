"use client"

import { CheckSquare } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import Sidebar from '@/components/layout/Sidebar'

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-8">
          <PageHeader 
            heading="Tasks"
            description="Manage your tasks and to-dos"
            icon={<div className="icon-tasks"><CheckSquare className="h-6 w-6" /></div>}
          />
          {/* Content will go here */}
        </div>
      </main>
    </div>
  )
}
