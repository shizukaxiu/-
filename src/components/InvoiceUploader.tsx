import { useState, useRef, useCallback } from 'react'
import { Upload, Loader2, FileCheck, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOCR } from '../hooks/useOCR'
import { formatCurrency } from '../utils/helpers'

export default function InvoiceUploader() {
  const { recognize, isRecognizing, invoice, error, reset } = useOCR()
  const [preview, setPreview] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return
      setCurrentFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
      await recognize(file)
    },
    [recognize]
  )

  const handleRetry = useCallback(() => {
    if (currentFile) recognize(currentFile)
  }, [currentFile, recognize])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleReset = () => {
    reset()
    setPreview(null)
    setCurrentFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isRecognizing ? '正在识别发票，请稍候' : invoice ? '发票识别完成' : error ? `识别失败：${error}` : ''}
      </div>
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">发票报销助手</h2>
          <p className="text-sm text-slate-500 mt-1">上传门诊/住院发票，自动识别费用并估算报销金额</p>
        </div>

        {!preview ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="上传发票图片，支持点击选择文件或拖拽文件到此处"
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:border-teal-400 ${
              dragOver
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <p className="text-sm font-medium text-slate-700">点击或拖拽上传发票图片</p>
            <p className="text-xs text-slate-500 mt-1">支持 JPG、PNG 格式，点击或按 Enter 选择文件</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-slate-100">
              <img src={preview} alt="发票预览" className="w-full h-full object-contain" />
              {isRecognizing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">正在识别发票信息...</p>
                  <p className="text-xs text-white/80 mt-1">首次加载 OCR 引擎可能需要几秒</p>
                </div>
              )}
            </div>
            <div className="p-4 flex justify-end">
              <button
                onClick={handleReset}
                aria-label="重新上传发票图片"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
              >
                <RefreshCw className="w-3 h-3" /> 重新上传
              </button>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 focus-visible:ring-2 focus-visible:ring-red-400"
            >
              重试
            </button>
          </div>
        )}

        {invoice && !isRecognizing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            role="region"
            aria-label="发票识别结果"
            className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden"
          >
            <div className="bg-teal-600 px-5 py-3 text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              <span className="font-semibold">识别结果</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">就诊医院</p>
                  <p className="font-medium text-slate-800">{invoice.hospital}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">发票日期</p>
                  <p className="font-medium text-slate-800">{invoice.date}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">发票编号</p>
                  <p className="font-medium text-slate-800">{invoice.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">总金额</p>
                  <p className="font-medium text-slate-800">{formatCurrency(invoice.total)}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-2">费用明细</p>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-500">{item.category}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700">预估可报销金额</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatCurrency(invoice.estimatedReimbursement)}
                  </p>
                </div>
                <div className="text-right text-xs text-green-700">
                  <p>报销比例约</p>
                  <p className="font-bold">70%</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
