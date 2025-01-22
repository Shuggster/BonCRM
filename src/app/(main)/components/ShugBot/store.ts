'use client'

import { create } from 'zustand'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface ShugBotState {
  isOpen: boolean
  messages: Message[]
  isLoading: boolean
  error: string | null
  previousContext: string | null
  setOpen: (open: boolean) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  clearError: () => void
}

export const useShugBotStore = create<ShugBotState>((set, get) => ({
  isOpen: false,
  messages: [{
    id: crypto.randomUUID(),
    role: 'assistant',
    content: "Hello! I'm Shug, your AI assistant. How can I help you today?",
    timestamp: new Date()
  }],
  isLoading: false,
  error: null,
  previousContext: null,
  
  setOpen: (open) => set({ isOpen: open }),
  
  sendMessage: async (content) => {
    try {
      set({ isLoading: true, error: null });
      
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        timestamp: new Date()
      }
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));

      const response = await fetch('/api/shugbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          previousContext: get().previousContext 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ShugBot');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        previousContext: data.context || null
      }));
    } catch (error) {
      console.error('ShugBot error:', error);
      set({
        error: 'Failed to send message. Please try again.',
        isLoading: false
      });
    }
  },
  
  clearMessages: () => set({
    messages: [{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Hello! I'm Shug, your AI assistant. How can I help you today?",
      timestamp: new Date()
    }],
    previousContext: null
  }),
  
  clearError: () => set({ error: null })
})); 