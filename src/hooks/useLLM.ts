import { useState, useCallback } from 'react'
import { streamChat } from '../services/llm'
import type { LLMMessage } from '../services/llm'

export function useLLM() {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (
      messages: LLMMessage[],
      onChunk: (chunk: string) => void,
      options?: { useRAG?: boolean }
    ) => {
      setIsLoading(true)
      try {
        for await (const chunk of streamChat(messages, options)) {
          onChunk(chunk)
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { sendMessage, isLoading }
}
