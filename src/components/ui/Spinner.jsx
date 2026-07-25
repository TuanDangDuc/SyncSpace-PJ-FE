import { cn } from '@/utils/cn'

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-2',
  xl: 'w-9 h-9 border-[3px]',
}

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'rounded-full border-gray-200 border-t-primary-500 animate-spin',
        sizes[size],
        className,
      )}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="xl" />
    </div>
  )
}
