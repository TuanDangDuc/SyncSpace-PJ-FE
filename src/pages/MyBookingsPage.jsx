import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, Clock, X, RefreshCw, AlertCircle,
  ChevronRight, Building2, Users, Layers, DollarSign,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { showToast } from '@/utils/toast'
import bookingService from '@/services/bookingService'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { PAYMENT_STATUS, PAYMENT_STATUS_LABEL, BOOKING_STATUS_LABEL, WORKSPACE_TYPE_LABEL } from '@/utils/constants'

const paymentVariant = { PAID: 'success', PENDING: 'warning', CANCELLED: 'danger', FAILED: 'danger' }
const slotVariant    = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'danger' }
const barColor       = { PAID: '#4A7C59', PENDING: '#B45309', CANCELLED: '#C0392B', FAILED: '#C0392B' }

function fmtDate(dt) { try { return format(parseISO(dt), 'dd MMM yyyy') } catch { return dt } }
function fmtTime(dt) { try { return format(parseISO(dt), 'HH:mm') }       catch { return dt } }
function fmtMoney(n) { return n != null ? `${Number(n).toLocaleString('vi-VN')}₫` : '—' }

/* ── Fallback thumbnail ─────────────────────────────────────────────────── */
const PLACEHOLDER = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80'

/* ── Cancel Confirmation Modal ──────────────────────────────────────────── */
function CancelModal({ bookingId, open, onClose, onSuccess, userId }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    try {
      await bookingService.cancel(bookingId, userId)
      showToast.success('Đã huỷ đặt phòng thành công')
      onSuccess()
      onClose()
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Không thể huỷ đặt phòng')
    } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Huỷ đặt phòng" size="sm">
      <div className="flex flex-col items-center text-center py-3">
        <div className="w-12 h-12 rounded-lg bg-danger-50 border border-danger-100 flex items-center justify-center mb-4">
          <AlertCircle size={22} className="text-danger-500" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-600 mb-5">Thao tác này không thể hoàn tác. Bạn chắc chắn muốn huỷ đặt phòng này?</p>
        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Giữ lại</Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={handle}>Xác nhận huỷ</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Single Slot Row ────────────────────────────────────────────────────── */
function SlotRow({ slot }) {
  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 rounded-2xl border border-gray-150 bg-stone-50/50 hover:bg-stone-50 transition-colors mb-4 last:mb-0">
      {/* Left: Thumbnail */}
      <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
        <img loading="lazy"
          src={slot.thumbnailUrl || PLACEHOLDER}
          alt={slot.roomNumber}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
      </div>

      {/* Middle-Left: Room details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="font-display font-bold text-gray-900 text-lg">
              Phòng {slot.roomNumber ?? '—'}
            </span>
            <Badge variant={slotVariant[slot.bookingStatus] || 'default'} size="md">
              {BOOKING_STATUS_LABEL?.[slot.bookingStatus] ?? slot.bookingStatus}
            </Badge>
          </div>
          <p className="text-sm text-stone-500 font-medium mb-2.5">
            {WORKSPACE_TYPE_LABEL?.[slot.workspaceType] ?? slot.workspaceType}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-400">
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-150">
            <Layers size={12} className="text-stone-400" /> Tầng {slot.floor ?? '—'}
          </span>
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-150">
            <Users size={12} className="text-stone-400" /> {slot.capacity ?? '—'} chỗ
          </span>
          {slot.acreage && (
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-150">
              {slot.acreage} m²
            </span>
          )}
          {slot.pricePerHour && (
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-150">
              <DollarSign size={12} className="text-stone-400" />{fmtMoney(slot.pricePerHour)}/h
            </span>
          )}
        </div>
      </div>

      {/* Middle-Right: Booking Time */}
      <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-stone-200/80 md:pl-5 pt-4 md:pt-0">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1.5 flex items-center gap-1.5">
          <Clock size={12} /> Thời gian sử dụng
        </span>
        <div className="text-stone-850">
          <p className="text-base font-semibold">{fmtTime(slot.startTime)} → {fmtTime(slot.endTime)}</p>
          <p className="text-sm text-stone-550 mt-0.5">{fmtDate(slot.startTime)}</p>
        </div>
      </div>

      {/* Right: Cost */}
      <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-stone-200/80 md:pl-5 pt-4 md:pt-0 shrink-0 min-w-[130px]">
        <span className="text-xs text-stone-400 mb-1">Chi phí slot</span>
        <span className="text-xl font-bold text-stone-900">{fmtMoney(slot.cost)}</span>
      </div>
    </div>
  )
}

/* ── Booking Card ───────────────────────────────────────────────────────── */
function BookingCard({ booking, onCancel }) {
  const canCancel = booking.paymentStatus === PAYMENT_STATUS.PENDING
  const color = barColor[booking.paymentStatus] || '#D9D0C5'

  return (
    <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden"
      style={{ boxShadow: '0 4px 12px rgba(28,25,23,0.03), 0 1px 3px rgba(28,25,23,0.06)' }}>

      {/* Top accent bar */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-mono text-stone-450 tracking-wider">
              MÃ ĐƠN HÀNG: <span className="font-semibold text-stone-700 break-all">{booking.id}</span>
            </p>
            <p className="text-sm text-stone-400 mt-0.5">Đặt ngày: {fmtDate(booking.createAt)}</p>
          </div>
          <Badge variant={paymentVariant[booking.paymentStatus] || 'default'} size="lg" dot>
            {PAYMENT_STATUS_LABEL?.[booking.paymentStatus] ?? booking.paymentStatus}
          </Badge>
        </div>

        {/* Slots */}
        <div className="space-y-4">
          {booking.bookingSlots?.length > 0
            ? booking.bookingSlots.map((s) => <SlotRow key={s.id} slot={s} />)
            : <p className="text-sm text-gray-400 text-center py-6">Không có slot đặt phòng</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-stone-150 mt-6">
          <div className="text-sm text-stone-500">
            Tổng cộng: <span className="font-semibold text-stone-850">{booking.bookingSlots?.length ?? 0} slot phòng</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-stone-900">{fmtMoney(booking.totalCost)}</span>
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(booking.id)}
                className="px-4 py-2 text-xs font-semibold"
              >
                Huỷ đặt phòng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
function BookingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
      <div className="h-1.5 bg-gray-100" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="rounded-2xl border border-gray-150 p-5 flex flex-col md:flex-row gap-5">
          <Skeleton className="w-full md:w-36 h-24 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex-1 space-y-2 md:pl-5 md:border-l border-stone-200">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="space-y-2 md:pl-5 md:border-l border-stone-200 shrink-0 w-24 text-right">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
        </div>
        <div className="flex justify-between pt-3 border-t border-stone-100">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function MyBookingsPage() {
  const { user } = useAuthStore()
  const [bookings,   setBookings]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [payFilter,  setPayFilter]  = useState('')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cancelId,   setCancelId]   = useState(null)

  const fetchBookings = () => {
    if (!user?.id) return
    setLoading(true)
    bookingService.getMyBookings(user.id, { page: page - 1, size: 5, status: payFilter, sort: 'createAt,desc' })
      .then((d) => {
        // API shape: { content: [...], page: { size, number, totalElements, totalPages } }
        const list = Array.isArray(d?.content) ? d.content : []
        setBookings(list)
        // support both nested page object and flat totalPages
        const tp = d?.page?.totalPages ?? d?.totalPages ?? 1
        setTotalPages(tp)
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [page, user?.id, payFilter])

  // Tính summary từ toàn bộ list hiện tại
  const paid    = bookings.filter(b => b.paymentStatus === PAYMENT_STATUS.PAID).length
  const pending = bookings.filter(b => b.paymentStatus === PAYMENT_STATUS.PENDING).length
  const spent   = bookings
    .filter(b => b.paymentStatus === PAYMENT_STATUS.PAID)
    .reduce((s, b) => s + (b.totalCost || 0), 0)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-[#FAF9F6] border-b border-gray-150">
        <div className="page-container py-10">
          <p className="section-label mb-2">History</p>
          <h1 className="font-display font-semibold text-gray-900 text-[2rem] mb-1">My Bookings</h1>
          <p className="text-sm text-gray-500">Theo dõi và quản lý các đặt phòng của bạn</p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Summary cards */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Đã thanh toán', value: paid,                            color: '#4A7C59' },
              { label: 'Chờ thanh toán', value: pending,                         color: '#B45309' },
              { label: 'Tổng đã chi',   value: fmtMoney(spent),                  color: '#1C1917' },
            ].map((s) => (
              <div key={s.label}
                className="bg-white rounded-xl border border-gray-150 p-4 text-center"
                style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
                <p className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2.5 mb-6 flex-wrap">
          <Select
            value={payFilter}
            onChange={(e) => { setPayFilter(e.target.value); setPage(1) }}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: PAYMENT_STATUS.PAID,      label: 'Đã thanh toán' },
              { value: PAYMENT_STATUS.PENDING,   label: 'Chờ thanh toán' },
              { value: PAYMENT_STATUS.CANCELLED, label: 'Đã huỷ' },
              { value: PAYMENT_STATUS.FAILED,    label: 'Thất bại' },
            ]}
            wrapperClassName="w-44"
          />
          {payFilter && (
            <Button variant="ghost" size="sm" icon={<X size={13} />}
              onClick={() => { setPayFilter(''); setPage(1) }}>
              Xoá lọc
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />}
            onClick={fetchBookings} className="ml-auto">
            Làm mới
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => <BookingSkeleton key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={22} strokeWidth={1.5} />}
            title="Chưa có booking nào"
            description="Hãy tìm một không gian làm việc và đặt phòng đầu tiên."
            action={
              <Link to="/locations">
                <Button variant="primary" size="sm" iconRight={<ChevronRight size={14} />}>
                  Khám phá địa điểm
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-6">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={setCancelId} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <CancelModal
        bookingId={cancelId}
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onSuccess={fetchBookings}
        userId={user?.id}
      />
    </div>
  )
}
