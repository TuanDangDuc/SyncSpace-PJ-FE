import { cn } from '@/utils/cn'
import Spinner from './Spinner'

const variants = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 border border-primary-600/20',
  secondary: 'bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-75 hover:border-gray-300',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:    'bg-danger-500 text-white hover:bg-danger-600 border border-danger-600/20',
  success:   'bg-success-500 text-white hover:bg-success-600',
  outline:   'border border-primary-300 text-primary-600 hover:bg-primary-50 bg-transparent',
  subtle:    'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100',
  warm:      'bg-cream-200 text-gray-700 border border-gray-200 hover:bg-cream-300',
}

const sizes = {
  xs:   'px-2.5 py-1    text-xs  rounded   gap-1',
  sm:   'px-3   py-1.5  text-sm  rounded   gap-1.5',
  md:   'px-3.5 py-2    text-sm  rounded-md gap-2',
  lg:   'px-4.5 py-2.5  text-sm  rounded-md gap-2',
  xl:   'px-5   py-3    text-base rounded-md gap-2',
  icon: 'p-2    rounded-md',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  iconRight,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none',
        'transition-all duration-150 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
}
