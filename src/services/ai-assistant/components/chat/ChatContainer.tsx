'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { AIMessage } from '../../services/ai-service'

interface ChatContainerProps {
  messages: AIMessage[]
  onSendMessage: (message: string) => void
  onFileUpload?: (file: File) => void
  isLoading?: boolean
  className?: string
}

export const ChatContainer = ({ 
  messages, 
  onSendMessage, 
  onFileUpload,
  isLoading,
  className = ''
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {isLoading && (
          <ChatMessage
            role="assistant"
            content="Thinking..."
            isLoading
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4">
        <ChatInput
          onSend={onSendMessage}
          onFileUpload={onFileUpload}
          disabled={isLoading}
          placeholder="Type a message..."
        />
      </div>
    </div>
  )
} 