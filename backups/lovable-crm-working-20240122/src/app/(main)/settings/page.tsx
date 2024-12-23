"use client"

import { Settings } from "lucide-react"
import { Shield } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <PageHeader 
        heading="Settings" 
        description="Manage your account settings and preferences"
        icon={Settings}
      />
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <a 
          href="/settings/general" 
          className="block rounded-lg border p-6 hover:bg-muted/50"
        >
          <Settings className="mb-4 h-6 w-6 text-muted-foreground" />
          <h3 className="mb-2 font-semibold">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure your basic account settings
          </p>
        </a>
        
        <a 
          href="/settings/security" 
          className="block rounded-lg border p-6 hover:bg-muted/50"
        >
          <Shield className="mb-4 h-6 w-6 text-muted-foreground" />
          <h3 className="mb-2 font-semibold">Security & Password</h3>
          <p className="text-sm text-muted-foreground">
            Manage your security preferences
          </p>
        </a>
      </div>
    </div>
  )
}
