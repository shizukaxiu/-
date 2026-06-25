import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-md mb-4">
              <Shield className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">医保经办助手</h1>
            <p className="text-sm text-neutral-500 mt-1">登录以继续使用智能医保服务</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
                用户名
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                密码
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-xl px-3 py-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <>
                  登录
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts hint */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 text-center mb-3">演示账号</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
                <User className="w-4 h-4 text-primary-600" aria-hidden="true" />
                <div className="text-left">
                  <p className="text-xs font-medium text-neutral-800">用户端</p>
                  <p className="text-[10px] text-neutral-500">111 / 111</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
                <Shield className="w-4 h-4 text-accent-600" aria-hidden="true" />
                <div className="text-left">
                  <p className="text-xs font-medium text-neutral-800">管理端</p>
                  <p className="text-[10px] text-neutral-500">222 / 222</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6">本地演示环境</p>
      </motion.div>
    </div>
  )
}
