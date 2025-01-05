"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send } from 'lucide-react'
import { PageHeader } from "@/components/ui/page-header"
import PageTransition from '@/components/animations/PageTransition'
import { ShugBotAPI } from '@/lib/shugbot/api'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ShugBotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const shugbotAPI = new ShugBotAPI()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await shugbotAPI.processMessage(inputValue, {
        currentPage: window.location.pathname
      })

      setMessages(prev => [...prev, response])
    } catch (error) {
      console.error('Error processing message:', error)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        content: "I apologize, I'm having trouble processing your request.",
        sender: 'bot',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-full">
        <div className="p-8">
          <PageHeader 
            heading="Ask Shug"
            description="Your AI assistant for CRM guidance and support"
            icon={<div className="icon-shugbot"><Bot className="h-6 w-6" /></div>}
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Welcome to ShugBot!</h3>
                <p className="text-sm text-zinc-400 max-w-md">
                  I'm here to help you with any questions about the CRM system. Feel free to ask about features, workflows, or best practices.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl rounded-2xl p-4 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500/30 to-blue-500/10 text-white'
                      : 'bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05]'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-2xl rounded-2xl p-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-white/[0.05]">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/[0.05] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  )
} 