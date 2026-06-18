import { MessageSquare, Wallet, MapPin, FileText, Trash2 } from 'lucide-react'
import { useChatStore } from '../store/chatStore'

const menuItems = [
  { id: 'chat', label: '智能对话', icon: MessageSquare },
  { id: 'invoice', label: '发票报销', icon: FileText },
  { id: 'account', label: '账户看板', icon: Wallet },
  { id: 'nearby', label: '附近机构', icon: MapPin },
] as const

export function Sidebar() {
  const { activeTool, setActiveTool, clearMessages } = useChatStore()

  return (
    <aside className="w-20 lg:w-64 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
      <div className="flex-1 py-6 space-y-2 px-2 lg:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = activeTool === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTool(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-400 ${
                active
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                  : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={clearMessages}
          title="清空对话"
          aria-label="清空对话"
          className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden lg:block">清空对话</span>
        </button>
      </div>
    </aside>
  )
}
