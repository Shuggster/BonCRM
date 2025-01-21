'use client'

import { ProtectedShugbot } from './protected-shugbot'

export default function AIToolsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">AI Tools</h1>
      <ProtectedShugbot />
    </div>
  )
} 