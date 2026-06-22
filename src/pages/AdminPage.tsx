import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, LayoutDashboard, LogOut, Database, FileStack, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { StatCard } from '../components/admin/StatCard'
import { FileList } from '../components/admin/FileList'
import { UploadZone } from '../components/admin/UploadZone'
import { RebuildPanel } from '../components/admin/RebuildPanel'
import {
  fetchFiles,
  fetchRebuildStatus,
  type AdminFilesResponse,
  type RebuildStatusResponse,
} from '../services/adminApi'

const POLL_INTERVAL = 1500

export function AdminPage() {
  const { user, logout } = useAuthStore()
  const [filesData, setFilesData] = useState<AdminFilesResponse | null>(null)
  const [rebuildStatus, setRebuildStatus] = useState<RebuildStatusResponse>({
    status: 'idle',
    progress: 0,
    message: '等待重建',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFiles = () => {
    setLoading(true)
    fetchFiles()
      .then((data) => {
        setFilesData(data)
        setError('')
      })
      .catch((err: Error) => {
        setError(err.message || '加载文件列表失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchFiles()
      .then((data) => {
        setFilesData(data)
        setError('')
      })
      .catch((err: Error) => {
        setError(err.message || '加载文件列表失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // 轮询重建状态
  useEffect(() => {
    const poll = () => {
      fetchRebuildStatus()
        .then((status) => {
          setRebuildStatus(status)
          if (status.status === 'success') {
            // 重建成功后刷新文件列表
            loadFiles()
          }
        })
        .catch(() => {
          // 忽略轮询错误
        })
    }

    const timer = setInterval(poll, POLL_INTERVAL)
    poll()
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-800">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              医
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-neutral-900">医保经办助手</h1>
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                  <Shield className="w-3 h-3" aria-hidden="true" />
                  管理后台
                </span>
              </div>
              <p className="text-xs text-neutral-500">知识库管理与文件维护</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200">
              <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
              {user?.username === '222' ? '系统管理员' : user?.role}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-error-700 hover:bg-error-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={FileStack}
              label="已收录文件"
              value={filesData?.totalFiles ?? 0}
              subtext="raw-policies 目录"
              variant="primary"
            />
            <StatCard
              icon={Database}
              label="知识库切片"
              value={filesData?.totalChunks ?? 0}
              subtext="可用于智能问答"
              variant="accent"
            />
            <StatCard
              icon={RefreshCw}
              label="最近构建"
              value={
                filesData?.builtAt
                  ? new Date(filesData.builtAt).toLocaleDateString('zh-CN')
                  : '未构建'
              }
              subtext={filesData?.builtAt ? new Date(filesData.builtAt).toLocaleTimeString('zh-CN') : '—'}
              variant="success"
            />
          </div>

          {/* Rebuild + Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RebuildPanel status={rebuildStatus} onStatusChange={setRebuildStatus} />
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <h3 className="text-base font-bold text-neutral-900 mb-1">上传政策文档</h3>
              <p className="text-xs text-neutral-500 mb-4">上传后需点击左侧“开始重建”更新知识库</p>
              <UploadZone onUploaded={loadFiles} />
            </div>
          </div>

          {/* File list */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neutral-900">已入库文件</h2>
              <button
                onClick={loadFiles}
                disabled={loading}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                刷新
              </button>
            </div>
            {error && (
              <div className="mb-4 text-sm text-error-700 bg-error-50 border border-error-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <FileList files={filesData?.files ?? []} />
          </section>
        </motion.div>
      </main>
    </div>
  )
}
