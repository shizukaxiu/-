import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { ChatPage } from './ChatPage'

const AccountDashboard = lazy(() => import('../components/AccountDashboard'))
const InvoiceUploader = lazy(() => import('../components/InvoiceUploader'))
const NearbyPage = lazy(() => import('./NearbyPage'))

function PageLoader() {
  return (
    <div className="h-full flex items-center justify-center text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span className="text-sm">加载中…</span>
    </div>
  )
}

export function HomePage() {
  const { activeTool } = useChatStore()

  return (
    <div className="h-full">
      {activeTool === 'chat' && <ChatPage />}
      {activeTool === 'account' && (
        <Suspense fallback={<PageLoader />}>
          <AccountDashboard />
        </Suspense>
      )}
      {activeTool === 'invoice' && (
        <Suspense fallback={<PageLoader />}>
          <InvoiceUploader />
        </Suspense>
      )}
      {activeTool === 'nearby' && (
        <Suspense fallback={<PageLoader />}>
          <NearbyPage />
        </Suspense>
      )}
    </div>
  )
}
