import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-xl focus:shadow-lg"
      >
        跳转至主内容
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden" tabIndex={-1}>
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
              医
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">医保经办助手</h1>
              <p className="text-xs text-slate-600">让老百姓像聊微信一样办医保</p>
            </div>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200" aria-label="演示数据，均为模拟">
            Demo 数据均为模拟
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  )
}
