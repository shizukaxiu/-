import { FileText, ExternalLink, Calendar, MapPin } from 'lucide-react'
import type { SearchResult } from '../types'

interface PolicyCardProps {
  result: SearchResult
}

export function PolicyCard({ result }: PolicyCardProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-4 max-w-md shadow-sm">
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary-800 line-clamp-2">
            {result.title || '相关政策'}
          </p>
          <p className="text-xs text-neutral-700 mt-2 leading-relaxed">{result.text}</p>

          <div className="mt-3 pt-3 border-t border-primary-100 space-y-1.5">
            {result.source && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{result.source}</span>
              </div>
            )}
            {result.publishDate && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{result.publishDate}</span>
              </div>
            )}
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`查看原文：${result.title || '相关政策'}（新窗口打开）`}
                className="inline-flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-800 active:text-primary-900 hover:underline focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
              >
                <ExternalLink className="w-3 h-3" />
                查看原文
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
