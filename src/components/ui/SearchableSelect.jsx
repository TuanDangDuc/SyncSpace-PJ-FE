import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown, Search, Check } from 'lucide-react'

export default function SearchableSelect({
  label, error, hint, options = [], placeholder, className, wrapperClassName,
  value, onChange
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  const selectedOption = useMemo(() => {
    return options.find(o => String(o.value) === String(value))
  }, [options, value])

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)} ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full bg-white border rounded-md px-3.5 py-2.5 pr-9 text-sm text-left',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400',
            'transition-all duration-150 hover:border-gray-300',
            error ? 'border-danger-400' : 'border-gray-200',
            selectedOption ? 'text-gray-900' : 'text-gray-500',
            className
          )}
        >
          <span className="block truncate">{selectedOption ? selectedOption.label : (placeholder || 'Select...')}</span>
        </button>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-150 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-60">
            <div className="p-2 border-b border-gray-100 shrink-0 relative bg-white">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-primary-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto flex-1 p-1 bg-white">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">No results found</div>
              ) : (
                filteredOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setIsOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between',
                      String(o.value) === String(value) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {String(o.value) === String(value) && <Check size={14} className="text-primary-600 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
