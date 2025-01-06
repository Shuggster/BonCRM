'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X } from 'lucide-react'

interface ShugBotPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ShugBotPopup({ isOpen, onClose }: ShugBotPopupProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    try {
      const response = await fetch('/api/shugbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from ShugBot')
      }

      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }
  }

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">ShugBot</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full pr-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'text-blue-400' : 'text-green-400'}`}>
              <strong>{message.role === 'assistant' ? 'ShugBot: ' : 'You: '}</strong>
              {message.content}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

