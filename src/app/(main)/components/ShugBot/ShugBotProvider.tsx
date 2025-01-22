'use client'

import { useEffect } from 'react'
import { useShugBotStore } from './store'
import { ShugBotPopup } from './ShugBotPopup'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export function ShugBotProvider() {
  const { isOpen, setOpen } = useShugBotStore()

  // Close ShugBot when navigating away
  useEffect(() => {
    return () => {
      setOpen(false)
    }
  }, [setOpen])

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      <div className="absolute inset-0 pointer-events-none">
        <ShugBotPopup isOpen={isOpen} onClose={() => setOpen(false)} />
      </div>
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        {!isOpen && (
          <Button
            onClick={() => setOpen(true)}
            size="icon"
            className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-300 opacity-30 group-hover:opacity-50 blur animate-pulse" />
            <Bot className="h-6 w-6 text-white relative z-10" />
          </Button>
        )}
      </div>
    </div>
  )
} 