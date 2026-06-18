import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import type { Message, SearchResult } from '../types'
import { PolicyCard } from './PolicyCard'

interface ChatBubbleProps {
  message: Message
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        aria-label={isUser ? '我' : '医保小助手'}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-neutral-200 text-neutral-600' : 'bg-gradient-to-br from-primary-500 to-accent-600 text-white'
        }`}
      >
        {isUser ? <User className="w-5 h-5" aria-hidden /> : <Bot className="w-5 h-5" aria-hidden />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-white text-neutral-700 border border-primary-100 rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.type === 'policy' && Boolean(message.meta) && (
          <div className="mt-2">
            <PolicyCard result={message.meta as SearchResult} />
          </div>
        )}
        {!isUser && message.type === 'success' && Boolean(message.meta) && (
          <SuccessCard meta={message.meta as { title: string; detail: string }} />
        )}
      </div>
    </motion.div>
  )
}

interface SuccessCardProps {
  meta: { title: string; detail: string }
}

function SuccessCard({ meta }: SuccessCardProps) {
  return (
    <div role="status" className="mt-2 p-3 bg-success-50 border border-success-200 rounded-xl text-sm text-success-800">
      <p className="font-semibold">✅ {meta.title}</p>
      <p className="text-xs mt-1 text-success-700">{meta.detail}</p>
    </div>
  )
}
