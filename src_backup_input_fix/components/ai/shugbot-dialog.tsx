'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, FileUp, Send, X, Sparkles } from "lucide-react"
import { useState } from "react"

interface ShugbotDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ShugbotDialog({ isOpen, onClose }: ShugbotDialogProps) {
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // File handling will be implemented when AI is integrated
    const files = Array.from(e.dataTransfer.files)
    console.log('Dropped files:', files)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    // Message handling will be implemented when AI is integrated
    console.log('Submitted message:', message)
    setMessage('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask Shug
          </DialogTitle>
          <DialogDescription>
            Hi! I'm Shug, your AI assistant. I can help you with any questions about our products or services.
          </DialogDescription>
        </DialogHeader>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 bg-background/10 rounded-lg p-3">
                <p className="text-sm">
                  Hi! I'm Shug, your AI assistant. I can help you with:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>CRM navigation and features</li>
                  <li>Technical product information</li>
                  <li>MSDS and specification sheets</li>
                  <li>General questions about our products</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit}>
            <div
              className={`relative rounded-lg border-2 transition-colors ${
                isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or drop files here..."
                className="w-full p-3 pr-24 bg-transparent resize-none focus:outline-none"
                rows={3}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-background/10 transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={!message.trim()}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
