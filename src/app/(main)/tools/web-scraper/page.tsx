"use client"

import { Globe } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"

export default function WebScraperPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader 
          heading="Web Scraper"
          description="Extract sales leads and contact information from websites"
          icon={<div className="icon-web-scraper"><Globe className="h-6 w-6" /></div>}
        />

        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Web Scraper Interface</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This tool will help you extract contact information and sales leads from websites.
              Enter a URL below to start scraping.
            </p>
            
            {/* Scraper interface will be added here */}
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
} 