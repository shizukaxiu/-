import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { triggerRebuild, fetchRebuildStatus, type RebuildStatusResponse } from '../../services/adminApi'

interface RebuildPanelProps {
  status: RebuildStatusResponse
  onStatusChange: (status: RebuildStatusResponse) => void
}

export function RebuildPanel({ status, onStatusChange }: RebuildPanelProps) {
  const [isStarting, setIsStarting] = useState(false)

  const handleRebuild = async () => {
    setIsStarting(true)
    try {
      await triggerRebuild()
      // 立即拉取一次状态
      const newStatus = await fetchRebuildStatus()
      onStatusChange(newStatus)
    } catch (err) {
      onStatusChange({
        status: 'error',
        progress: 0,
        message: '启动重建失败',
        error: err instanceof Error ? err.message : '未知错误',
      })
    } finally {
      setIsStarting(false)
    }
  }

  const isRunning = status.status === 'running' || isStarting
  const isSuccess = status.status === 'success'
  const isError = status.status === 'error'

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900">知识库重建</h3>
          <p className="text-xs text-neutral-500 mt-1">
            上传新文件后，需要重建索引才能被智能问答检索到。
          </p>
        </div>
        <button
          onClick={handleRebuild}
          disabled={isRunning}
          className="h-10 px-5 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors shrink-0"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              重建中
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              开始重建
            </>
          )}
        </button>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className={`font-medium ${isError ? 'text-error-700' : 'text-neutral-600'}`}>{status.message}</span>
          <span className="text-neutral-400">{status.progress}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isError ? 'bg-error-500' : isSuccess ? 'bg-success-500' : 'bg-primary-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Status message */}
      {isSuccess && (
        <div className="mt-4 flex items-center gap-2 text-sm text-success-700 bg-success-50 border border-success-200 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          <span>重建完成，新文件已加入知识库</span>
        </div>
      )}

      {isError && (
        <div className="mt-4 flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p>重建失败</p>
            {status.error && <p className="text-xs mt-1 text-error-600">{status.error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
