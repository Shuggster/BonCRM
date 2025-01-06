'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Settings } from 'lucide-react'

export default function GeneralSettingsPage() {
  return (
    <div className="container py-6">
      <PageHeader
        heading="General Settings"
        description="Manage your account settings and preferences."
        icon={Settings}
      />

      <div className="mt-8">
        {/* General settings form will go here */}
      </div>
    </div>
  )
}
