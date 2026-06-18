import { useState, useCallback, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any

interface UseSpeechOptions {
  onTranscript?: (transcript: string) => void
}

interface UseSpeechReturn {
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  supported: boolean
}

function getSpeechRecognitionAPI() {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export function useSpeech(options?: UseSpeechOptions): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(() => {
    return getSpeechRecognitionAPI() ? null : '当前浏览器不支持语音识别，请手动输入'
  })
  const [supported] = useState(() => !!getSpeechRecognitionAPI())

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI()
    if (!SpeechRecognitionAPI) return

    const recog = new SpeechRecognitionAPI()
    recog.lang = 'zh-CN'
    recog.continuous = false
    recog.interimResults = true

    recog.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recog.onend = () => {
      setIsListening(false)
    }

    recog.onresult = (event: SpeechRecognitionInstance) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += result
        } else {
          interim += result
        }
      }
      setTranscript((prev) => {
        const next = prev + final + interim
        optionsRef.current?.onTranscript?.(next)
        return next
      })
    }

    recog.onerror = (event: SpeechRecognitionInstance) => {
      setError(`语音识别出错: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current = recog

    return () => {
      try {
        recog.stop()
      } catch {
        // 可能尚未启动，忽略错误
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const recog = recognitionRef.current
    if (!recog) return
    setTranscript('')
    try {
      recog.start()
    } catch (err) {
      console.error('启动语音识别失败:', err)
    }
  }, [])

  const stopListening = useCallback(() => {
    const recog = recognitionRef.current
    if (!recog) return
    try {
      recog.stop()
    } catch (err) {
      console.error('停止语音识别失败:', err)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    supported,
  }
}
