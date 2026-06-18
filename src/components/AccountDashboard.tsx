import { useMemo } from 'react'
import { Wallet, TrendingUp, Receipt, CreditCard, Activity } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import user from '../mock/user.json'
import { formatCurrency } from '../utils/helpers'

export default function AccountDashboard() {
  const profile = useMemo(() => user, [])

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">个人账户看板</h2>
          <p className="text-sm text-neutral-600 mt-1">
            {profile.name} · {profile.insuredCity} · {profile.insuranceType}
          </p>
        </div>

        {/* 账户概览：避免 hero-metric 四宫格，改为单一概览面板 */}
        <section aria-label="账户概览" className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="sm:col-span-2 lg:col-span-1 lg:border-r lg:border-neutral-100 lg:pr-6">
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <Wallet className="w-4 h-4" aria-hidden />
                <span>账户余额</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {formatCurrency(profile.balance)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">可用余额</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <TrendingUp className="w-4 h-4" aria-hidden />
                <span>年度消费</span>
              </div>
              <p className="text-xl font-semibold text-neutral-800 mt-1">
                {formatCurrency(profile.thisYearSpent)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">本年累计</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <Receipt className="w-4 h-4" aria-hidden />
                <span>报销次数</span>
              </div>
              <p className="text-xl font-semibold text-neutral-800 mt-1">
                {profile.reimbursementRecords.length} 次
              </p>
              <p className="text-xs text-neutral-500 mt-1">近半年</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <CreditCard className="w-4 h-4" aria-hidden />
                <span>医保卡号</span>
              </div>
              <p className="text-xl font-semibold text-neutral-800 mt-1 font-mono">
                {profile.idCard}
              </p>
              <p className="text-xs text-neutral-500 mt-1">已实名</p>
            </div>
          </div>
        </section>

        {/* 消费趋势 */}
        <section aria-label="年度消费趋势" className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" aria-hidden />
            <h3 className="font-semibold text-neutral-800">年度消费趋势</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile.monthlySpending}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => `¥${value}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), '消费金额']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 最近报销记录 */}
        <section aria-label="最近报销记录" className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <h3 className="font-semibold text-neutral-800 mb-4">最近报销记录</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500">
                  <th scope="col" className="text-left py-2 font-medium">日期</th>
                  <th scope="col" className="text-left py-2 font-medium">医院</th>
                  <th scope="col" className="text-right py-2 font-medium">总费用</th>
                  <th scope="col" className="text-right py-2 font-medium">报销金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {profile.reimbursementRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                      暂无报销记录
                    </td>
                  </tr>
                ) : (
                  profile.reimbursementRecords.map((record, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-neutral-600">{record.date}</td>
                      <td className="py-3 text-neutral-800">{record.hospital}</td>
                      <td className="py-3 text-right text-neutral-600">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="py-3 text-right font-medium text-primary-600">
                        {formatCurrency(record.reimbursed)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
