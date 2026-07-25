import { cn } from '@/utils/cn'

const variants = {
  default:  'bg-gray-100  text-gray-600  border-gray-200',
  primary:  'bg-primary-50 text-primary-700 border-primary-200',
  success:  'bg-success-50 text-success-700 border-success-100',
  warning:  'bg-warning-50 text-warning-700 border-warning-100',
  danger:   'bg-danger-50  text-danger-700  border-danger-100',
  info:     'bg-info-50    text-info-700    border-info-100',
  warm:     'bg-cream-200  text-gray-600   border-gray-200',
}

const dotColor = {
  default:  'bg-gray-400',
  primary:  'bg-primary-500',
  success:  'bg-success-500',
  warning:  'bg-warning-500',
  danger:   'bg-danger-500',
  info:     'bg-info-500',
  warm:     'bg-primary-400',
}

const sizes = {
  sm: 'px-1.5 py-px   text-[10px]',
  md: 'px-2   py-0.5  text-[11px]',
  lg: 'px-2.5 py-1    text-xs',
}

export default function Badge({ children, variant = 'default', size = 'md', dot = false, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded border leading-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor[variant])} />}
      {children}
    </span>
  )
}
