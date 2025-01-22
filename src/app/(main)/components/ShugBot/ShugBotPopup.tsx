'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert } from "@/components/ui/alert"
import { Bot, Send, X, Loader2, Mic } from 'lucide-react'
import { useShugBotStore } from './store'
import Draggable from 'react-draggable'

interface ShugBotPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ShugBotPopup({ isOpen, onClose }: ShugBotPopupProps) {
  const { messages, isLoading, error, sendMessage, clearError } = useShugBotStore()
  const [input, setInput] = useState('')
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 400,
    y: window.innerHeight - 600
  }))
  const nodeRef = useRef(null)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
    setInput('')
  }

  if (!isOpen) return null

  return (
    <Draggable
      handle=".drag-handle"
      bounds="parent"
      position={position}
      onStop={(e, data) => {
        setPosition({ x: data.x, y: data.y })
      }}
      nodeRef={nodeRef}
    >
      <Card ref={nodeRef} className="absolute w-80 bg-[#1a1a1a] border-none text-white shadow-2xl rounded-3xl overflow-hidden pointer-events-auto" style={{ zIndex: 101 }}>
        <CardHeader className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] pb-4 pt-6 drag-handle cursor-move select-none">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium flex items-center gap-3 px-2 select-none">
              <Bot className="h-6 w-6 text-cyan-400" />
              Chat AI Bot
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="m-2">
              <p className="text-sm">{error}</p>
            </Alert>
          )}
          <ScrollArea className="h-[400px] px-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.role === 'assistant'
                    ? 'bg-[#2a2a2a] p-3 rounded-2xl'
                    : 'text-right'
                }`}
              >
                <div className={`inline-block ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white p-3 rounded-2xl'
                    : ''
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 bg-[#1a1a1a] border-t border-[#2a2a2a] gap-2">
          <Input
            placeholder="Write your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="bg-[#2a2a2a] border-none text-white placeholder:text-gray-400"
          />
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-[#2a2a2a]"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Draggable>
  )
} 