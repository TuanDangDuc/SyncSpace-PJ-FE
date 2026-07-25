import { useState, useEffect } from 'react'
import { Users, Building2, CalendarCheck, DollarSign, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import adminService from '@/services/adminService'
import bookingService from '@/services/bookingService'
import workspaceService from '@/services/workspaceService'
import StatCard from '@/components/ui/StatCard'
import Skeleton from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { PAYMENT_STATUS, PAYMENT_STATUS_LABEL, WORKSPACE_STATUS } from '@/utils/constants'

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 12400000 },
  { month: 'Feb', revenue: 18700000 },
  { month: 'Mar', revenue: 15200000 },
  { month: 'Apr', revenue: 22100000 },
  { month: 'May', revenue: 19800000 },
  { month: 'Jun', revenue: 27500000 },
  { month: 'Jul', revenue: 24300000 },
]

const PIE_COLORS = ['#22c55e', '#eab308', '#f43f5e']
const payBadge   = { PAID: 'success', PENDING: 'warning', CANCELLED: 'danger', FAILED: 'danger' }

function fmt(dt) { try { return format(parseISO(dt), 'dd MMM, HH:mm') } catch { return dt ?? '—' } }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-lg">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{payload[0].value?.toLocaleString('vi-VN')}₫</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats,    setStats]    = useState(null)
  const [bookings, setBookings] = useState([])
  const [wsStats,  setWsStats]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.allSettled([
      adminService.getUsers({ page: 0, size: 1 }),    // to get totalElements from page info
      workspaceService.getAll({ page: 0, size: 100 }),
    ]).then(([u, w]) => {
      const totalUsers = u.status === 'fulfilled' ? (u.value?.page?.totalElements ?? 0) : 0
      const wsList     = w.status === 'fulfilled' ? (w.value?.content ?? []) : []
      setStats({ totalUsers, totalWorkspaces: wsList.length })
      setWsStats([
        { name: 'Active',      value: wsList.filter(x => x.status === WORKSPACE_STATUS.ACTIVE).length },
        { name: 'Maintenance', value: wsList.filter(x => x.status === WORKSPACE_STATUS.MAINTENANCE).length },
        { name: 'Inactive',    value: wsList.filter(x => x.status === WORKSPACE_STATUS.INACTIVE).length },
      ].filter(s => s.value > 0))
    }).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { title: 'Total Users',    value: stats?.totalUsers ?? '—',     icon: <Users size={18} />,         color: 'primary', trend: { value: 12 } },
    { title: 'Workspaces',     value: stats?.totalWorkspaces ?? '—', icon: <Building2 size={18} />,     color: 'violet',  trend: { value: 5  } },
    { title: 'Recent Bookings', value: bookings.length,             icon: <CalendarCheck size={18} />, color: 'success', trend: { value: 18 } },
    { title: 'Revenue',        value: '— (pending API)',             icon: <DollarSign size={18} />,   color: 'warning', trend: { value: 0  } },
  ]

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((s) => <StatCard key={s.title} {...s} />)
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Revenue</p>
              <p className="text-xs text-gray-500">Monthly trend</p>
            </div>
            <Badge variant="success" dot>Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_REVENUE} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#b5b5b5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#b5b5b5', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                fill="url(#rGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
          <p className="font-semibold text-gray-900 text-sm mb-1">Workspace Status</p>
          <p className="text-xs text-gray-500 mb-4">Current distribution</p>
          {wsStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={wsStats} cx="50%" cy="45%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {wsStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: '#737373', fontSize: 11 }}>{v}</span>} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <Skeleton className="w-28 h-28 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Recent Bookings</p>
            <p className="text-xs text-gray-500">Latest transactions</p>
          </div>
          <a href="/admin/bookings" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Booking ID', 'User', 'Created', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><Skeleton className="h-3.5 w-full" /></td>
                    ))}</tr>
                  ))
                : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-400">#{b.id?.slice(0,8).toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{b.user?.username ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{fmt(b.createAt)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.totalCost?.toLocaleString('vi-VN')}₫</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={payBadge[b.paymentStatus] || 'default'} dot size="sm">
                          {PAYMENT_STATUS_LABEL[b.paymentStatus]}
                        </Badge>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
