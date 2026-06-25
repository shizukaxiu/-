import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '../store/authStore'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-screen w-full bg-neutral-50 text-neutral-800 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-xl focus:shadow-lg"
      >
        跳转至主内容
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden" tabIndex={-1}>
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              医
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">医保经办助手</h1>
              <p className="text-xs text-neutral-600">让老百姓像聊微信一样办医保</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-error-700 hover:bg-error-50 px-3 py-1.5 rounded-full transition-colors"
                aria-label="退出登录"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">退出</span>
              </button>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  )
}
