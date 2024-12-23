import Link from 'next/link'
import { Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import { SettingsNav } from '@/components/settings/SettingsNav'

const navItems = [
  {
    title: 'General',
    href: '/settings/general',
    icon: Settings,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-6">
      <Suspense fallback={<div className="h-10" />}>
        <SettingsNav />
      </Suspense>
      {children}
    </div>
  )
}
