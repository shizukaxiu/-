export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageType = 'text' | 'policy' | 'record' | 'invoice' | 'form' | 'success'

export interface Message {
  id: string
  role: MessageRole
  content: string
  type?: MessageType
  meta?: unknown
  timestamp: number
}

export interface PolicyQA {
  id: string
  question: string
  keywords: string[]
  answer: string
  meta?: SearchResult
}

export interface UserProfile {
  name: string
  idCard: string
  insuredCity: string
  insuranceType: string
  balance: number
  thisYearSpent: number
  reimbursementRecords: ReimbursementRecord[]
  monthlySpending: MonthlySpending[]
}

export interface ReimbursementRecord {
  date: string
  hospital: string
  amount: number
  reimbursed: number
}

export interface MonthlySpending {
  month: string
  amount: number
}

export interface InvoiceItem {
  name: string
  amount: number
  category: string
}

export interface Invoice {
  invoiceNo: string
  hospital: string
  date: string
  items: InvoiceItem[]
  total: number
  estimatedReimbursement: number
}

export interface Hospital {
  id: string
  name: string
  type: 'hospital' | 'pharmacy'
  address: string
  distance: string
  level: string
  tags: string[]
  lat: number
  lng: number
}

export type ActiveTool = 'chat' | 'account' | 'nearby' | 'invoice'

export interface SearchResult {
  id: string
  text: string
  source: string
  city: string
  category: string
  publishDate?: string
  title?: string
  url?: string
  score: number
}

export interface ChatState {
  messages: Message[]
  isTyping: boolean
  activeTool: ActiveTool
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  setTyping: (typing: boolean) => void
  setActiveTool: (tool: ActiveTool) => void
  clearMessages: () => void
  loadHistory: () => void
}
