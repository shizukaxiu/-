import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtext?: string
  variant?: 'primary' | 'accent' | 'success'
}

export function StatCard({ icon: Icon, label, value, subtext, variant = 'primary' }: StatCardProps) {
  const variantClasses = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    accent: 'bg-accent-50 border-accent-200 text-accent-700',
    success: 'bg-success-50 border-success-200 text-success-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${variantClasses[variant]}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-neutral-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-neutral-400 mt-1">{subtext}</p>}
      </div>
    </div>
  )
}
