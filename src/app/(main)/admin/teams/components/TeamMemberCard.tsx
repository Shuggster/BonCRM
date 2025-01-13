"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
}

interface TeamMemberCardProps {
  member: TeamMember
  onRemove: () => void
}

export function TeamMemberCard({ member, onRemove }: TeamMemberCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-white/[0.08]">
      <div className="flex flex-col">
        <span className="font-medium">{member.name}</span>
        <span className="text-sm text-muted-foreground">{member.email}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 