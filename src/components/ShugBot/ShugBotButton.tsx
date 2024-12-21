'use client'

import { Button } from "@/components/ui/Button"
import { Bot } from 'lucide-react'

interface ShugBotButtonProps {
  onClick: () => void
}

export function ShugBotButton({ onClick }: ShugBotButtonProps) {
  return (
    <Button onClick={onClick} variant="ghost" size="sm">
      <Bot className="mr-2 h-4 w-4" />
      Ask Shug
    </Button>
  )
}

