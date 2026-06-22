import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBubble } from '../components/ChatBubble'
import { ChatInput } from '../components/ChatInput'
import { DigitalHuman } from '../components/DigitalHuman'
import { useChatStore } from '../store/chatStore'
import { useLLM } from '../hooks/useLLM'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { searchPolicies } from '../services/rag'
import user from '../mock/user.json'
import type { LLMMessage } from '../services/llm'

export function ChatPage() {
  const { messages, isTyping, addMessage, setTyping } = useChatStore()
  const { sendMessage, isLoading } = useLLM()
  const prefersReducedMotion = useReducedMotion()
  const [currentReply, setCurrentReply] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasGreeted = useRef(false)
  const [typingTimestamp, setTypingTimestamp] = useState(0)

  // 开场问候
  useEffect(() => {
    if (messages.length === 0 && !hasGreeted.current) {
      hasGreeted.current = true
      addMessage({
        role: 'assistant',
        content: '您好，我是您的医保小助手，请问有什么可以帮您？您可以问我医保报销、异地就医备案、账户查询等问题。',
        type: 'text',
      })
    }
  }, [messages.length, addMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentReply])

  const handleSpecialCommands = useCallback(
    (text: string): boolean => {
      const lower = text.toLowerCase()

      // 异地备案流程：仅在用户明确表达办理/申请意图时才直接弹表单
      // 咨询类问题（如"怎么办理""如何备案"）应交给 LLM/RAG 回答
      const hasRemoteKeyword = /异地|备案|外省|跨省/.test(lower)
      const hasApplyIntent = /(我要|帮我|给我|申请|办理|备案一下|办一下|报一下).*(异地|备案|外省|跨省)/.test(lower)
      const isConsultation = /(怎么|如何|怎样|什么|吗\s*$|政策|规定|流程|条件|要求|标准)/.test(lower)

      if (hasRemoteKeyword && hasApplyIntent && !isConsultation) {
        addMessage({
          role: 'assistant',
          content: '我可以帮您办理异地就医备案。已为您预填个人信息，请确认：',
          type: 'form',
          meta: {
            formType: 'remoteRecord',
            data: {
              name: user.name,
              idCard: user.idCard,
              insuredCity: user.insuredCity,
              targetCity: /上海/.test(text) ? '上海市' : /广州/.test(text) ? '广州市' : '就医地',
              recordType: '跨省异地长期居住',
            },
          },
        })
        return true
      }

      return false
    },
    [addMessage]
  )

  const handleSend = useCallback(
    async (text: string) => {
      addMessage({ role: 'user', content: text, type: 'text' })
      setTyping(true)
      setCurrentReply('')
      setTypingTimestamp(Date.now())

      // 优先处理特殊业务指令
      if (handleSpecialCommands(text)) {
        setTyping(false)
        return
      }

      const history: LLMMessage[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      let reply = ''
      let messageType: 'text' | 'policy' = 'text'
      let meta: unknown

      // 先尝试 RAG 匹配
      const policies = await searchPolicies(text)
      if (policies.length > 0 && !import.meta.env.VITE_DEEPSEEK_API_KEY) {
        // 无 API Key 时直接走 RAG 回复
        reply = policies[0].answer
        messageType = 'policy'
        meta = policies[0].meta || { question: policies[0].question, answer: policies[0].answer }
        addMessage({ role: 'assistant', content: reply, type: messageType, meta })
        setTyping(false)
        return
      }

      // 有 API Key 时调用 LLM
      await sendMessage(
        [...history, { role: 'user', content: text }],
        (chunk) => {
          reply += chunk
          setCurrentReply(reply)
        },
        { useRAG: true }
      )

      if (policies.length > 0) {
        messageType = 'policy'
        meta = { question: policies[0].question, answer: reply }
      }

      addMessage({ role: 'assistant', content: reply, type: messageType, meta })
      setCurrentReply('')
      setTyping(false)
    },
    [addMessage, messages, sendMessage, setTyping, handleSpecialCommands]
  )

  return (
    <div className="flex h-full">
      {/* 左侧对话区 */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5"
          role="log"
          aria-live="polite"
          aria-label="对话消息"
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {currentReply && (
            <ChatBubble
              message={{
                id: 'typing',
                role: 'assistant',
                content: currentReply,
                timestamp: typingTimestamp,
              }}
            />
          )}

          {isTyping && !currentReply && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div aria-hidden="true" className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white">
                <span className="text-xs">AI</span>
              </div>
              <div className="bg-white border border-primary-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                {prefersReducedMotion ? (
                  <span className="text-sm text-neutral-500">正在思考中…</span>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* 备案表单渲染 */}
          {messages[messages.length - 1]?.type === 'form' &&
            (messages[messages.length - 1]?.meta as { formType?: string } | undefined)?.formType ===
              'remoteRecord' && (
              <RemoteRecordForm />
            )}

          <div ref={messagesEndRef} />
        </div>
        {/* 移动端快捷提问 */}
        <QuickQuestions onSend={handleSend} />

        <ChatInput onSend={handleSend} disabled={isLoading || isTyping} />
      </div>

      {/* 右侧数字人 */}
      <div className="hidden lg:flex w-72 flex-shrink-0 border-l border-neutral-200 bg-white flex-col items-center justify-center p-6">
        <DigitalHuman isSpeaking={isTyping || !!currentReply} />
        <div className="mt-8 w-full space-y-3">
          <p className="text-sm font-medium text-neutral-700 text-center">试试这样问</p>
          {['异地就医怎么备案？', '医保报销需要哪些材料？', '个人账户余额怎么查询？'].map(
            (q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                aria-label={`发送问题：${q}`}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-neutral-50 hover:bg-primary-50 active:bg-primary-100 text-sm text-neutral-600 hover:text-primary-700 active:text-primary-800 transition-colors border border-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-400 min-h-[44px]"
              >
                {q}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function RemoteRecordForm() {
  const { addMessage, setTyping } = useChatStore()
  const data = {
    name: user.name,
    idCard: user.idCard,
    insuredCity: user.insuredCity,
    targetCity: '上海市',
    recordType: '跨省异地长期居住',
  }

  const handleConfirm = () => {
    setTyping(true)
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: '备案申请已提交，审核通过后您可在就医地直接结算。',
        type: 'success',
        meta: {
          title: '异地就医备案成功',
          detail: '备案编号：YB20260617001 · 生效时间：2026-06-17',
        },
      })
      setTyping(false)
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ml-12 max-w-md bg-white border border-primary-200 rounded-2xl p-5 shadow-sm"
    >
      <h4 className="font-semibold text-neutral-800 mb-4">异地就医备案申请表</h4>
      <div className="space-y-3 text-sm">
        {Object.entries({
          姓名: data.name,
          身份证号: data.idCard,
          参保地: data.insuredCity,
          就医地: data.targetCity,
          备案类型: data.recordType,
        }).map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-neutral-50 pb-2">
            <span className="text-neutral-500">{label}</span>
            <span className="font-medium text-neutral-800">{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        aria-label="确认提交异地就医备案申请"
        className="mt-5 w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 hover:shadow-md transition-all focus-visible:ring-2 focus-visible:ring-primary-400 active:bg-primary-800 active:scale-[0.98] min-h-[48px]"
      >
        确认提交备案
      </button>
    </motion.div>
  )
}
function QuickQuestions({ onSend }: { onSend: (text: string) => void }) {
  const questions = ['异地就医怎么备案？', '医保报销需要哪些材料？', '个人账户余额怎么查询？']

  return (
    <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs text-neutral-500 mb-2">试试这样问</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            aria-label={`发送问题：${q}`}
            className="flex-shrink-0 px-3 py-2 rounded-full bg-neutral-50 hover:bg-primary-50 active:bg-primary-100 text-xs text-neutral-600 hover:text-primary-700 active:text-primary-800 border border-neutral-200 transition-colors focus-visible:ring-2 focus-visible:ring-primary-400 whitespace-nowrap min-h-[44px] flex items-center"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
