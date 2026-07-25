import { cn } from '@/utils/cn'

export default function Skeleton({ className, ...props }) {
  return (
    <div className={cn('rounded-lg shimmer', className)} {...props} />
  )
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-150 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
