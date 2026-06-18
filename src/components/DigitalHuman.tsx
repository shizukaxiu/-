import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface DigitalHumanProps {
  isSpeaking?: boolean
}

export function DigitalHuman({ isSpeaking = false }: DigitalHumanProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-28 h-28 lg:w-36 lg:h-36" aria-hidden="true">
        {/* 语音波纹动画 */}
        {isSpeaking && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-300"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-300"
              animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
        {isSpeaking && prefersReducedMotion && (
          <div className="absolute inset-0 rounded-full border-2 border-teal-300 opacity-60" />
        )}
        {/* 头像 */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 lg:w-24 lg:h-24 text-teal-600"
            fill="currentColor"
          >
            <circle cx="50" cy="35" r="22" />
            <path d="M20 85 C20 60 80 60 80 85" />
          </svg>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-slate-700">医保小助手</p>
        <p className="text-xs text-slate-600">{isSpeaking ? '正在说话...' : '随时为您服务'}</p>
      </div>
    </div>
  )
}
