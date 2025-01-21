'use client'

import { useState } from 'react'
import { ChatContainer } from './chat/ChatContainer'
import { AIService, AIMessage } from '../services/ai-service'
import { Bot } from 'lucide-react'

// Initialize AI Service
const aiService = new AIService()

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "I'm here to help you with any questions about the CRM system.\nFeel free to ask about features, workflows, or best practices.",
  timestamp: Date.now()
}

export const TestPage = () => {
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      // Add user message immediately
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, userMessage])
      
      // Process with AI service
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

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const response = await aiService.processFile(file)
      const botMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <Bot className="w-6 h-6" />
        <div>
          <h1 className="font-semibold">Ask Shug</h1>
          <p className="text-sm text-white/70">Your AI assistant for CRM guidance and support</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 