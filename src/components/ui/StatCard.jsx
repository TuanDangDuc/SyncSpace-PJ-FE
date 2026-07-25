import { cn } from '@/utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  primary: { wrap: 'bg-primary-50 text-primary-600', },
  success: { wrap: 'bg-success-50 text-success-600', },
  warning: { wrap: 'bg-warning-50 text-warning-600', },
  danger:  { wrap: 'bg-danger-50  text-danger-600',  },
  violet:  { wrap: 'bg-violet-50  text-violet-600',  },
}

export default function StatCard({ title, value, subtitle, icon, trend, color = 'primary', className }) {
  const c = colorMap[color] || colorMap.primary
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-card p-5 flex items-start gap-4', className)}>
      {icon && (
        <div className={cn('p-2.5 rounded-xl shrink-0', c.wrap)}>{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 truncate">{value}</p>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-success-600' : 'text-danger-600')}>
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  )
}
