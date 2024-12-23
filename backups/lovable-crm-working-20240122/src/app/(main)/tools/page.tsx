"use client"

import { Wrench } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ToolsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader 
          heading="Tools"
          description="Productivity tools and utilities"
          icon={<div className="icon-tools"><Wrench className="h-6 w-6" /></div>}
        />

        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/tools/web-scraper">
            <Card className="p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Web Scraper</h3>
              <p className="text-sm text-muted-foreground">
                Extract sales leads and contact information from websites automatically.
              </p>
            </Card>
          </Link>
          
          {/* More tools can be added here */}
        </div>
      </div>
    </main>
  )
} 