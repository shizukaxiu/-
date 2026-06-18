import { useState, useRef } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const { isListening, startListening, stopListening, resetTranscript, supported } = useSpeech({
    onTranscript: (transcript) => setText(transcript),
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    resetTranscript()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleMic = () => {
    if (isListening) {
      stopListening()
    } else {
      setText('')
      resetTranscript()
      startListening()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
        <button
          onClick={toggleMic}
          disabled={!supported || disabled}
          className={`p-2.5 rounded-full transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            isListening
              ? 'bg-red-100 text-red-600 animate-pulse'
              : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100'
          }`}
          title={supported ? '语音输入' : '浏览器不支持语音'}
          aria-label={isListening ? '停止语音输入' : supported ? '语音输入' : '浏览器不支持语音'}
          aria-pressed={isListening}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={isListening ? '正在听您说...' : '请输入您想咨询的医保问题...'}
          rows={1}
          aria-label="医保问题输入框"
          className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-sm text-slate-700 placeholder:text-slate-500 max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          aria-label="发送"
          className="p-2.5 rounded-full bg-teal-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 hover:shadow-md transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-teal-800 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-500 mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  )
}
