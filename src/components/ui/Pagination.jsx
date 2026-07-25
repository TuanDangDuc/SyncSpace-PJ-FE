import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left  = Math.max(2, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  pages.push(1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('...')
  if (totalPages > 1) pages.push(totalPages)

  const btnBase = 'w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(page - 1)} disabled={page === 1}
        className={cn(btnBase, 'text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed')}
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
          : (
            <button key={p} onClick={() => onChange(p)}
              className={cn(btnBase, p === page
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100')}>
              {p}
            </button>
          )
      )}

      <button
        onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className={cn(btnBase, 'text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed')}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
