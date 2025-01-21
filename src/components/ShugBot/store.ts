import { create } from 'zustand'

interface Message {
  role: 'assistant' | 'user'
  content: string
  timestamp?: number
}

interface ShugBotState {
  isOpen: boolean
  messages: Message[]
  isLoading: boolean
  toggleShugBot: () => void
  openShugBot: () => void
  closeShugBot: () => void
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
}

export const useShugBotStore = create<ShugBotState>((set, get) => ({
  isOpen: false,
  messages: [{
    role: 'assistant',
    content: "Hello! I'm Shug, your AI assistant. How can I help you today?",
    timestamp: Date.now()
  }],
  isLoading: false,

  toggleShugBot: () => set((state) => ({ isOpen: !state.isOpen })),
  openShugBot: () => set({ isOpen: true }),
  closeShugBot: () => set({ isOpen: false }),
  
  sendMessage: async (message: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error from API:', data);
        throw new Error(data.error || 'Failed to get response');
      }

      if (!data.reply) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from API');
      }

      // Add the user's message and the bot's response
      set(state => ({
        messages: [
          ...state.messages,
          { role: 'user', content: message },
          { role: 'assistant', content: data.reply }
        ]
      }));
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Add an error message to the chat
      set(state => ({
        messages: [
          ...state.messages,
          { role: 'user', content: message },
          { role: 'assistant', content: 'I apologize, but I encountered an error while processing your message. Please try again.' }
        ]
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  clearMessages: () => set((state) => ({
    messages: [{
      role: 'assistant',
      content: "Hello! I'm Shug, your AI assistant. How can I help you today?",
      timestamp: Date.now()
    }]
  }))
})) 