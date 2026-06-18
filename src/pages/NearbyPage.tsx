import { useState, useMemo } from 'react'
import { MapPin, Phone, Navigation, Hospital, Pill, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import hospitals from '../mock/hospitals.json'
import type { Hospital as HospitalType } from '../types'

export default function NearbyPage() {
  const [filter, setFilter] = useState<'all' | 'hospital' | 'pharmacy'>('all')
  const [selected, setSelected] = useState<HospitalType | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return hospitals as HospitalType[]
    return (hospitals as HospitalType[]).filter((h) => h.type === filter)
  }, [filter])

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* 列表 */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">附近定点机构</h2>
              <p className="text-sm text-slate-500 mt-1">基于您当前位置推荐附近医保定点医院/药店</p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {(['all', 'hospital', 'pharmacy'] as const).map((type) => {
                const label = type === 'all' ? '全部' : type === 'hospital' ? '医院' : '药店'
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    aria-pressed={filter === type}
                    aria-label={`按${label}筛选`}
                    className={`px-3 py-2 text-xs rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[36px] ${
                      filter === type
                        ? 'bg-teal-500 text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">当前筛选条件下暂无机构</p>
            </div>
          ) : (
          <ul className="space-y-3" role="listbox" aria-label="附近定点机构列表">
            {filtered.map((hospital, idx) => {
              const isSelected = selected?.id === hospital.id
              return (
              <motion.li
                key={hospital.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                role="option"
                aria-selected={isSelected}
                onClick={() => setSelected(hospital)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-400 ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-100'
                    : 'border-slate-200'
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(hospital)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      hospital.type === 'hospital'
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-cyan-50 text-cyan-600'
                    }`}
                  >
                    {hospital.type === 'hospital' ? (
                      <Hospital className="w-5 h-5" />
                    ) : (
                      <Pill className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 truncate">{hospital.name}</h3>
                      <span className="text-xs text-teal-600 font-medium">{hospital.distance}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{hospital.level}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden /> {hospital.address}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {hospital.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.li>
            )})}
          </ul>
          )}
        </div>
      </div>

      {/* 右侧地图占位 */}
      <div aria-label="地图示意区域" className="hidden lg:flex w-96 flex-shrink-0 bg-slate-100 border-l border-slate-200 flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {selected ? (
          <div className="relative z-10 bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                {selected.type === 'hospital' ? (
                  <Hospital className="w-5 h-5" />
                ) : (
                  <Pill className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{selected.name}</h3>
                <p className="text-xs text-slate-500">{selected.level}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">{selected.address}</p>
            <div className="flex gap-2">
              <button aria-label={`导航到 ${selected.name}`} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-teal-500 text-white text-sm hover:bg-teal-600 active:bg-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]">
                <Navigation className="w-4 h-4" aria-hidden /> 导航
              </button>
              <button aria-label={`拨打 ${selected.name} 电话`} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]">
                <Phone className="w-4 h-4" aria-hidden /> 电话
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center text-slate-500">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <p className="text-sm">点击左侧机构查看详情</p>
            <p className="text-xs mt-1">地图展示为示意效果</p>
          </div>
        )}
      </div>
    </div>
  )
}
