'use client'

import { UserForm } from "./UserForm"

interface QuickAddUserProps {
  onSuccess: () => void
  onCancel: () => void
}

export function QuickAddUser({ onSuccess, onCancel }: QuickAddUserProps) {
  return (
    <div className="rounded-b-2xl bg-[#111111] border-t border-white/[0.08]">
      <UserForm onSuccess={onSuccess} onCancel={onCancel} />
    </div>
  )
} 