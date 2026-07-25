import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder, className, wrapperClassName, ...props },
  ref,
) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full bg-white border rounded-md px-3.5 py-2.5 pr-9 text-sm text-gray-900',
            'appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400',
            'transition-all duration-150 hover:border-gray-300',
            error ? 'border-danger-400' : 'border-gray-200',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
})

export default Select
