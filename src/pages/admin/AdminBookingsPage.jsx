import { useState, useEffect, useCallback } from 'react'
import { Search, X, RefreshCw, Eye, DollarSign, CalendarCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import bookingService from '@/services/bookingService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { PAYMENT_STATUS, PAYMENT_STATUS_LABEL, BOOKING_STATUS, BOOKING_STATUS_LABEL } from '@/utils/constants'

const payBadge     = { PAID: 'success', PENDING: 'warning', CANCELLED: 'danger', FAILED: 'danger', REFUNDED: 'info' }
const bookingBadge = { CONFIRMED: 'success', PENDING: 'warning', CANCELLED: 'danger' }

function fmt(dt) { try { return format(parseISO(dt), 'dd MMM yyyy, HH:mm') } catch { return dt ?? '—' } }

function BookingDetailModal({ booking, open, onClose, onPaymentChange }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    toast('Tính năng cập nhật thanh toán đang được phát triển')
  }

  if (!booking) return null

  return (
    <Modal open={open} onClose={onClose} title="Booking details" size="md">
      <div className="space-y-4">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Booking ID',  value: booking.id?.slice(0, 12) + '…' },
            { label: 'Created',     value: fmt(booking.createAt) },
            { label: 'Total cost',  value: `${booking.totalCost?.toLocaleString('vi-VN')}₫` },
            { label: 'Payment',     value: PAYMENT_STATUS_LABEL[booking.paymentStatus] },
            { label: 'User email',  value: booking.userEmail ?? '—' },
            { label: 'User ID',     value: booking.userId?.slice(0, 8) + '…' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[11px] text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Slots */}
        {booking.bookingSlots?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Slots</p>
            <div className="space-y-2">
              {booking.bookingSlots.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div>
                    <p className="font-medium text-gray-900">Room {s.roomNumber ?? '—'}</p>
                    <p className="text-gray-500 mt-0.5">{fmt(s.startTime)} → {fmt(s.endTime)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={bookingBadge[s.bookingStatus] || 'default'} size="sm">
                      {BOOKING_STATUS_LABEL[s.bookingStatus]}
                    </Badge>
                    <p className="text-gray-900 font-semibold mt-1">{s.cost?.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Update payment */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update payment</p>
          <div className="flex gap-2 flex-wrap">
            {[PAYMENT_STATUS.PAID, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.FAILED].map((s) => (
              <span key={s}>
                <Button size="sm" loading={loading}
                  variant={s === PAYMENT_STATUS.PAID ? 'success' : s === PAYMENT_STATUS.CANCELLED ? 'danger' : 'secondary'}
                  disabled={booking.paymentStatus === s}
                  onClick={handlePayment}>
                  {PAYMENT_STATUS_LABEL[s]}
                </Button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminBookingsPage() {
  const [bookings,   setBookings]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [query,      setQuery]      = useState('')
  const [payFilter,  setPayFilter]  = useState('')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected,   setSelected]   = useState(null)

  const fetchBookings = useCallback(() => {
    setLoading(true)
    bookingService.getAllBookings({ page: page - 1, size: 8, status: payFilter })
      .then((d) => {
        const list = Array.isArray(d?.content) ? d.content : []
        setBookings(list)
        const tp = d?.page?.totalPages ?? d?.totalPages ?? 1
        setTotalPages(tp)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Không thể tải danh sách booking')
        setBookings([])
      })
      .finally(() => setLoading(false))
  }, [page, payFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const paid      = bookings.filter(b => b.paymentStatus === PAYMENT_STATUS.PAID).length
  const pending   = bookings.filter(b => b.paymentStatus === PAYMENT_STATUS.PENDING).length
  const cancelled = bookings.filter(b => b.paymentStatus === PAYMENT_STATUS.CANCELLED).length

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">All workspace reservations</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={fetchBookings}>Refresh</Button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Paid',      value: paid,      color: 'text-success-600' },
          { label: 'Pending',   value: pending,   color: 'text-warning-600' },
          { label: 'Cancelled', value: cancelled, color: 'text-danger-600'  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap">
        <Input placeholder="Search booking ID…" value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          icon={<Search size={14} />}
          iconRight={query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          wrapperClassName="w-48" />
        <Select value={payFilter} onChange={(e) => { setPayFilter(e.target.value); setPage(1) }}
          options={[
            { value: '', label: 'All statuses' },
            ...Object.entries(PAYMENT_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l })),
          ]}
          wrapperClassName="w-40" />
        {(query || payFilter) && (
          <Button variant="ghost" size="sm" icon={<X size={13} />}
            onClick={() => { setQuery(''); setPayFilter(''); setPage(1) }}>Clear</Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Booking ID', 'User', 'Slots', 'Created', 'Total', 'Payment', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : bookings.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={<CalendarCheck size={22} />} title="No bookings found" className="py-12" /></td></tr>
                  : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-400">#{b.id?.slice(0,8).toUpperCase()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{b.userEmail ?? b.userId?.slice(0,8) ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{b.bookingSlots?.length ?? 0}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmt(b.createAt)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{b.totalCost?.toLocaleString('vi-VN')}₫</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={payBadge[b.paymentStatus] || 'default'} dot size="sm">
                          {PAYMENT_STATUS_LABEL[b.paymentStatus]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(b)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-end px-5 py-3.5 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <BookingDetailModal booking={selected} open={!!selected}
        onClose={() => setSelected(null)} onPaymentChange={fetchBookings} />
    </div>
  )
}
