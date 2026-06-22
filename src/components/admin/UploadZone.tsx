import { useState, useRef } from 'react'
import { Upload, FileUp, X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadFile } from '../../services/adminApi'

interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface UploadZoneProps {
  onUploaded: () => void
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const isSupported = (file: File) => /\.(pdf|docx?|txt|md)$/i.test(file.name)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newItems: UploadQueueItem[] = Array.from(files)
      .filter(isSupported)
      .map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'pending',
        progress: 0,
      }))

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems])
      // 自动开始上传
      newItems.forEach((item) => uploadItem(item))
    }
  }

  const uploadItem = async (item: UploadQueueItem) => {
    setQueue((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i)))

    try {
      await uploadFile(item.file)
      setQueue((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'success', progress: 100 } : i)))
      onUploaded()
    } catch (err) {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'error', error: err instanceof Error ? err.message : '上传失败' }
            : i
        )
      )
    }
  }

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-primary-400 bg-primary-50/50' : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-neutral-50'}
        `}
        role="button"
        tabIndex={0}
        aria-label="上传文件"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-5 h-5 text-primary-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-neutral-700">
          拖拽文件到此处，或 <span className="text-primary-600">点击选择</span>
        </p>
        <p className="text-xs text-neutral-400 mt-1.5">支持 PDF、DOC、DOCX、TXT、MD，单个文件建议不超过 20MB</p>
      </div>

      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3"
          >
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">上传队列</p>
            {queue.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                  <FileUp className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-700 truncate">{item.file.name}</p>
                  <p className="text-xs text-neutral-400">
                    {item.status === 'uploading' && '上传中...'}
                    {item.status === 'success' && '上传成功'}
                    {item.status === 'error' && <span className="text-error-600">{item.error}</span>}
                  </p>
                </div>
                {item.status === 'success' && <CheckCircle className="w-4 h-4 text-success-600" aria-hidden="true" />}
                {item.status === 'error' && <AlertCircle className="w-4 h-4 text-error-600" aria-hidden="true" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeItem(item.id)
                  }}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="移除"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
