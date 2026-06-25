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
import type { SearchResult } from '../types'

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
      const topResult = policies[0]?.meta as SearchResult | undefined

      if (policies.length > 0 && !import.meta.env.VITE_DEEPSEEK_API_KEY) {
        // 无 API Key 时直接走 RAG 回复
        reply = policies[0].answer
        messageType = 'policy'
        meta = topResult || { question: policies[0].question, answer: policies[0].answer }
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

      if (topResult) {
        messageType = 'policy'
        meta = topResult
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
              <RemoteRecordForm query={messages[messages.length - 2]?.content || ''} />
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
          {['职工医保住院报销比例是多少？', '医保报销需要哪些材料？', '2026年居民医保个人缴费多少？'].map(
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

const RECORD_TYPES = ['跨省异地长期居住', '临时外出就医']

const CITY_MAP: Record<string, string> = {
  北京: '北京市',
  上海: '上海市',
  广州: '广州市',
  深圳: '深圳市',
  杭州: '杭州市',
  南京: '南京市',
  苏州: '苏州市',
  扬州: '扬州市',
  无锡: '无锡市',
  常州: '常州市',
  徐州: '徐州市',
  南通: '南通市',
  泰州: '泰州市',
  盐城: '盐城市',
  淮安: '淮安市',
  宿迁: '宿迁市',
  连云港: '连云港市',
  镇江: '镇江市',
  成都: '成都市',
  重庆: '重庆市',
  武汉: '武汉市',
  西安: '西安市',
  天津: '天津市',
  青岛: '青岛市',
  济南: '济南市',
  合肥: '合肥市',
  长沙: '长沙市',
  郑州: '郑州市',
  福州: '福州市',
  厦门: '厦门市',
  沈阳: '沈阳市',
  大连: '大连市',
  哈尔滨: '哈尔滨市',
  长春: '长春市',
  昆明: '昆明市',
  贵阳: '贵阳市',
  南宁: '南宁市',
  南昌: '南昌市',
  石家庄: '石家庄市',
  太原: '太原市',
  兰州: '兰州市',
  海口: '海口市',
  银川: '银川市',
  西宁: '西宁市',
  拉萨: '拉萨市',
  乌鲁木齐: '乌鲁木齐市',
  呼和浩特: '呼和浩特市',
}

function inferTargetCity(query: string): string {
  for (const [key, value] of Object.entries(CITY_MAP)) {
    if (query.includes(key)) return value
  }
  return '上海市'
}

function inferRecordType(query: string): string {
  const q = query.toLowerCase()
  if (/临时|短期|出差|旅游|旅行|转院|急诊|抢救/.test(q)) return '临时外出就医'
  if (/长期|居住|工作|学习|安置|随迁|养老/.test(q)) return '跨省异地长期居住'
  return '跨省异地长期居住'
}

function RemoteRecordForm({ query }: { query: string }) {
  const { addMessage, setTyping } = useChatStore()
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [targetCity, setTargetCity] = useState(() => inferTargetCity(query))
  const [recordType, setRecordType] = useState(() => inferRecordType(query))

  const data = {
    name: user.name,
    idCard: user.idCard,
    insuredCity: user.insuredCity,
    targetCity,
    recordType,
  }

  const handleConfirm = () => {
    setTyping(true)
    setTimeout(() => {
      const recordNo = `YB${startDate.replace(/-/g, '')}001`
      addMessage({
        role: 'assistant',
        content: '备案申请已提交，审核通过后您可在就医地直接结算。',
        type: 'success',
        meta: {
          title: '异地就医备案成功',
          detail: `备案编号：${recordNo} · 就医地：${targetCity} · 生效时间：${startDate}`,
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
        }).map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-neutral-50 pb-2">
            <span className="text-neutral-500">{label}</span>
            <span className="font-medium text-neutral-800">{value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
          <span className="text-neutral-500">就医地</span>
          <input
            type="text"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
            className="text-sm font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400 w-40 text-right"
          />
        </div>
        <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
          <span className="text-neutral-500">备案类型</span>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="text-sm font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
          <span className="text-neutral-500">备案开始日期</span>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
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
  const questions = ['职工医保住院报销比例是多少？', '医保报销需要哪些材料？', '2026年居民医保个人缴费多少？']

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
