import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-7xl',
}

export default function Modal({ open, onClose, title, children, size = 'md', hideClose = false, className }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px] animate-fade-in" />

      {/* Panel */}
      <div className={cn(
        'relative w-full bg-white rounded-2xl shadow-xl border border-gray-100',
        'animate-slide-up flex flex-col max-h-[90vh]',
        sizes[size],
        className,
      )}>
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            {title && <h2 className="font-semibold text-gray-900">{title}</h2>}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
