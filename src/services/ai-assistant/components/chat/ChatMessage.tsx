'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

export const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  const isBot = role === 'assistant'
  
  return (
    <div className={cn(
      "flex gap-2",
      isBot ? "flex-row" : "flex-row-reverse"
    )}>
      {/* Message Content */}
      <div className={cn(
        "rounded-2xl px-4 py-2 max-w-[85%]",
        isBot ? "bg-[#1e2736] text-white" : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
      )}>
        <p className="whitespace-pre-wrap">{content}</p>
        
        {/* Attribution and Actions (only for bot messages) */}
        {isBot && !isLoading && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span>via gemini</span>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:text-white transition-colors">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="p-1 hover:text-white transition-colors">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 