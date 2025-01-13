"use client"

import { Users2 } from "lucide-react"

export default function DefaultView() {
  return (
    <div className="p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center mx-auto mb-4">
          <Users2 className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-lg font-semibold mb-2">User Management</h2>
        <p className="text-zinc-400">Select a user to view details<br />or click "New User" to create one</p>
      </div>
    </div>
  )
} 