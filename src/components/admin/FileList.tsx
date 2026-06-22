import { FileText, FileSpreadsheet, FileType, File } from 'lucide-react'
import type { AdminFileInfo } from '../../services/adminApi'

interface FileListProps {
  files: AdminFileInfo[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return FileText
    case 'doc':
    case 'docx':
      return FileSpreadsheet
    case 'md':
      return FileType
    default:
      return File
  }
}

function getFileBadge(fileName: string): { text: string; className: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, { text: string; className: string }> = {
    pdf: { text: 'PDF', className: 'bg-error-50 text-error-700 border-error-200' },
    doc: { text: 'DOC', className: 'bg-primary-50 text-primary-700 border-primary-200' },
    docx: { text: 'DOCX', className: 'bg-primary-50 text-primary-700 border-primary-200' },
    txt: { text: 'TXT', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
    md: { text: 'MD', className: 'bg-accent-50 text-accent-700 border-accent-200' },
  }
  return map[ext] || { text: ext.toUpperCase(), className: 'bg-neutral-100 text-neutral-600 border-neutral-200' }
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-5 h-5 text-neutral-400" aria-hidden="true" />
        </div>
        <p className="text-sm text-neutral-500">暂无已收录文件</p>
        <p className="text-xs text-neutral-400 mt-1">上传 PDF 或 Word 文档后将在此显示</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-500">文件名</th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-500">类型</th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-500">大小</th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-500">切片数</th>
              <th className="px-5 py-3 text-xs font-semibold text-neutral-500">更新时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {files.map((file) => {
              const Icon = getFileIcon(file.fileName)
              const badge = getFileBadge(file.fileName)
              return (
                <tr key={file.fileName} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4.5 h-4.5 text-neutral-400" aria-hidden="true" />
                      <span className="text-sm text-neutral-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                        {file.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">{formatBytes(file.size)}</td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">{file.chunkCount}</td>
                  <td className="px-5 py-3.5 text-xs text-neutral-400">
                    {new Date(file.updatedAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
