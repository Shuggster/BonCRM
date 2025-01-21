import { AI_ASSISTANT_CONFIG, isFeatureEnabled, isFileSafe } from '../config'

// Types for messages and responses
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface AIResponse {
  message: AIMessage
  error?: string
}

// Safe AI Service that doesn't touch core systems
export class AIService {
  private messages: AIMessage[] = []

  constructor() {
    // Initialize with empty message history
  }

  async processMessage(message: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context: {
            currentPage: window.location.pathname,
            messages: this.messages
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from ShugBot')
      }

      const data = await response.json()
      
      // Add message to history
      this.messages.push(
        {
          id: Date.now().toString(),
          role: 'user',
          content: message,
          timestamp: Date.now()
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }
      )

      return data.response
    } catch (error) {
      console.error('Error processing message:', error)
      return "I apologize, I'm having trouble processing your request right now."
    }
  }

  async processFile(file: File): Promise<string> {
    if (!isFileSafe(file)) {
      return "I'm sorry, I can't process this type of file for security reasons."
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai/process-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Error processing file:', error)
      return "I apologize, I'm having trouble processing your file right now."
    }
  }
} 