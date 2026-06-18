import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatState, Message } from '../types'

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isTyping: false,
      activeTool: 'chat',

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },

      setTyping: (typing) => set({ isTyping: typing }),

      setActiveTool: (tool) => set({ activeTool: tool }),

      clearMessages: () => set({ messages: [] }),

      loadHistory: () => {
        // persist middleware 会自动加载，这里预留扩展点
      },
    }),
    {
      name: 'medical-insurance-assistant-history',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
)
