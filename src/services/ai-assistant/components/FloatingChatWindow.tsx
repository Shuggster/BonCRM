'use client'

import { useState, useRef, useCallback } from 'react'
import { Bot, X } from 'lucide-react'
import { ChatContainer } from './chat/ChatContainer'
import { AIService, AIMessage } from '../services/ai-service'
import { cn } from '@/lib/utils'

const aiService = new AIService()

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello there! How can I assist you today?",
  timestamp: Date.now()
}

export const FloatingChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      return; // Don't initiate drag if clicking on a button
    }
    setIsDragging(true)
    dragRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragRef.current) {
      const newX = e.clientX - dragRef.current.x
      const newY = e.clientY - dragRef.current.y
      
      // Ensure the chat window stays within viewport bounds
      const maxX = window.innerWidth - 380 // width of the chat window
      const maxY = window.innerHeight - 600 // height of the chat window
      
      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      })
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragRef.current = null
  }, [])

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, userMessage])
      
      const response = await aiService.processMessage(message)
      const botMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error processing message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Bot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg transition-colors"
      >
        <Bot className="h-6 w-6 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex w-[380px] flex-col rounded-xl bg-[#0f1419] text-white shadow-xl",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400" />
              <span className="font-medium">Test Bot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="h-[500px] overflow-hidden">
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  )
} 