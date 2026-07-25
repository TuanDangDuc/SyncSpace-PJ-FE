import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, ChevronRight, ChevronLeft, Users, Building2, Clock, DollarSign, Calendar, CheckCircle, Plus, Trash2, X } from 'lucide-react'
import { format, addDays, startOfWeek, isBefore, isToday, isSameDay } from 'date-fns'
import { showToast } from '@/utils/toast'
import workspaceService from '@/services/workspaceService'
import bookingService from '@/services/bookingService'
import locationService from '@/services/locationService'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { WORKSPACE_TYPE_LABEL, WORKSPACE_STATUS, WORKSPACE_STATUS_LABEL, STATUS_META } from '@/utils/constants'
import { cn } from '@/utils/cn'

// ── Helpers ─────────────────────────────────────────────
const HOUR_START = 6   // 06:00
const HOUR_END   = 22  // 22:00
const TOTAL_SLOTS = (HOUR_END - HOUR_START) * 2  // 32 slots of 30-min each

function slotLabel(slotIdx) {
  const totalMins = HOUR_START * 60 + slotIdx * 30
  const h = Math.floor(totalMins / 60).toString().padStart(2, '0')
  const m = (totalMins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function slotToDateTime(dateStr, slotIdx) {
  return `${dateStr}T${slotLabel(slotIdx)}:00`
}

function groupConsecutiveSlots(slots) {
  if (!slots.length) return []
  const sorted = [...slots].sort((a, b) => a - b)
  const groups = []
  let start = sorted[0], prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) { prev = sorted[i] }
    else { groups.push({ start, end: prev }); start = sorted[i]; prev = sorted[i] }
  }
  groups.push({ start, end: prev })
  return groups
}

// ── BookingModal ─────────────────────────────────────────
function BookingModal({ workspace, open, onClose }) {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // week navigation
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  // selectedSlots: { [dateStr]: Set<slotIdx> }
  const [selectedSlots, setSelectedSlots] = useState({})
  const [dragStart, setDragStart] = useState(null)

  useEffect(() => { if (open) { setSelectedSlots({}); setSuccess(false) } }, [open])

  const toggleSlot = (dateStr, slotIdx) => {
    setSelectedSlots(prev => {
      const next = { ...prev }
      const set = new Set(next[dateStr] || [])
      if (set.has(slotIdx)) set.delete(slotIdx)
      else set.add(slotIdx)
      if (set.size === 0) delete next[dateStr]
      else next[dateStr] = set
      return next
    })
  }

  const handleMouseDown = (dateStr, slotIdx) => { setDragStart({ dateStr, slotIdx }) }
  const handleMouseEnter = (dateStr, slotIdx) => {
    if (!dragStart || dragStart.dateStr !== dateStr) return
    const { slotIdx: startIdx } = dragStart
    setSelectedSlots(prev => {
      const next = { ...prev }
      const set = new Set(next[dateStr] || [])
      const lo = Math.min(startIdx, slotIdx), hi = Math.max(startIdx, slotIdx)
      for (let i = lo; i <= hi; i++) set.add(i)
      next[dateStr] = set
      return next
    })
  }
  const handleMouseUp = () => setDragStart(null)

  // Build booking slots list for preview and API
  const bookingSlotsList = useMemo(() => {
    const result = []
    for (const [dateStr, set] of Object.entries(selectedSlots)) {
      const groups = groupConsecutiveSlots([...set])
      for (const { start, end } of groups) {
        result.push({ dateStr, startTime: slotToDateTime(dateStr, start), endTime: slotToDateTime(dateStr, end + 1) })
      }
    }
    return result.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [selectedSlots])

  const totalHours = useMemo(() => {
    let sum = 0
    for (const [, set] of Object.entries(selectedSlots)) sum += set.size * 0.5
    return sum
  }, [selectedSlots])
  const costPreview = totalHours * (workspace?.pricePerHour ?? 0)

  const onSubmit = async () => {
    if (!isAuthenticated) { showToast.error('Sign in to book'); navigate('/login'); return }
    if (!user?.id) { showToast.error('Không tìm thấy thông tin người dùng'); return }
    if (bookingSlotsList.length === 0) { showToast.error('Vui lòng chọn ít nhất một khung giờ'); return }
    setLoading(true)
    try {
      await bookingService.create({
        userId: user.id,
        bookingSlots: bookingSlotsList.map(s => ({
          workspaceId: workspace.id,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      })
      setSuccess(true)
      showToast.success('Workspace booked!')
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  if (success) return (
    <Modal open={open} onClose={() => { setSuccess(false); onClose() }} title="" size="sm" hideClose>
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-success-50 border border-success-200 flex items-center justify-center mb-4">
          <CheckCircle size={28} className="text-success-600" />
        </div>
        <p className="font-semibold text-gray-900 mb-1">Booking confirmed!</p>
        <p className="text-sm text-gray-500 mb-5">Room {workspace?.roomNumber} has been reserved.</p>
        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setSuccess(false); onClose() }}>Close</Button>
          <Button variant="primary"   size="sm" className="flex-1" onClick={() => navigate('/my-bookings')}>View bookings</Button>
        </div>
      </div>
    </Modal>
  )

  // Time header labels (every hour)
  const hourLabels = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => `${(HOUR_START + i).toString().padStart(2, '0')}:00`)
  const today = new Date()

  return (
    <Modal open={open} onClose={onClose} title={`Đặt lịch — Phòng ${workspace?.roomNumber}`} size="xl">
      <div className="flex flex-col gap-4" onMouseUp={handleMouseUp}>

        {/* Room info strip */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Phòng {workspace?.roomNumber} · Tầng {workspace?.floor}</p>
            <p className="text-xs text-gray-500">{WORKSPACE_TYPE_LABEL[workspace?.type]} · {workspace?.capacity} người · {workspace?.pricePerHour?.toLocaleString('vi-VN')}₫/giờ</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium shrink-0">
            <span className="flex items-center gap-1.5 text-gray-400"><div className="w-3 h-3 rounded-sm bg-gray-200"/>Đã qua</span>
            <span className="flex items-center gap-1.5 text-primary-600"><div className="w-3 h-3 rounded-sm bg-primary-400"/>Đã chọn</span>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekStart(d => addDays(d, -7))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {format(weekStart, 'dd/MM/yyyy')} — {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
          </span>
          <button onClick={() => setWeekStart(d => addDays(d, 7))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Timeline grid */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 select-none">
          <div style={{ minWidth: `${TOTAL_SLOTS * 28 + 72}px` }}>

            {/* Hour header row */}
            <div className="flex border-b border-gray-200 bg-sky-50">
              <div className="w-[72px] shrink-0 border-r border-gray-200" />
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
                <div key={i} className="relative" style={{ width: 28, flexShrink: 0 }}>
                  {i % 2 === 0 && (
                    <span className="absolute -left-px top-1.5 text-[10px] font-bold text-sky-700 whitespace-nowrap pl-1">
                      {slotLabel(i)}
                    </span>
                  )}
                  <div className="h-8" />
                </div>
              ))}
            </div>

            {/* Day rows */}
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isPast  = isBefore(day, new Date(format(today, 'yyyy-MM-dd')))
              const todayRow = isToday(day)
              const daySlots = selectedSlots[dateStr] || new Set()

              return (
                <div key={dateStr} className={cn('flex border-b border-gray-100 last:border-b-0', todayRow && 'bg-primary-50/30')}>
                  {/* Day label */}
                  <div className={cn('w-[72px] shrink-0 border-r border-gray-200 flex flex-col items-center justify-center py-2 text-center', isPast ? 'opacity-40' : '')}>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">{format(day, 'EEE')}</span>
                    <span className={cn('text-sm font-bold mt-0.5', todayRow ? 'text-primary-600' : 'text-gray-800')}>{format(day, 'dd')}</span>
                  </div>

                  {/* Slot cells */}
                  {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                    const isSelected = daySlots.has(i)
                    const isHourBoundary = i % 2 === 0
                    return (
                      <div
                        key={i}
                        style={{ width: 28, flexShrink: 0 }}
                        className={cn(
                          'h-10 border-r cursor-pointer transition-colors',
                          isHourBoundary ? 'border-gray-200' : 'border-gray-100',
                          isPast ? 'bg-gray-100 cursor-not-allowed' :
                            isSelected ? 'bg-primary-400 hover:bg-primary-500' :
                              'bg-white hover:bg-primary-50'
                        )}
                        onMouseDown={isPast ? undefined : () => handleMouseDown(dateStr, i)}
                        onMouseEnter={isPast ? undefined : () => handleMouseEnter(dateStr, i)}
                        onClick={isPast ? undefined : () => !dragStart && toggleSlot(dateStr, i)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected slots summary */}
        {bookingSlotsList.length > 0 && (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Các khung giờ đã chọn ({bookingSlotsList.length} slot):</p>
            <div className="flex flex-wrap gap-2">
              {bookingSlotsList.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
                  <Calendar size={10} />
                  {format(new Date(s.dateStr), 'dd/MM')} &nbsp;
                  <Clock size={10} />
                  {slotLabel(Math.min(...[...selectedSlots[s.dateStr]]))} → {s.endTime.slice(11, 16)}
                  <button onClick={() => {
                    setSelectedSlots(prev => {
                      const next = { ...prev }
                      const startSlot = Math.min(...bookingSlotsList.filter(b => b.dateStr === s.dateStr).flatMap(b => [...selectedSlots[b.dateStr]]))
                      const endSlot   = Math.max(...bookingSlotsList.filter(b => b.dateStr === s.dateStr).flatMap(b => [...selectedSlots[b.dateStr]]))
                      const set = new Set(next[s.dateStr] || [])
                      const groups = groupConsecutiveSlots([...set])
                      const grp = groups[bookingSlotsList.filter(b => b.dateStr === s.dateStr).indexOf(s)]
                      if (grp) for (let x = grp.start; x <= grp.end; x++) set.delete(x)
                      if (set.size === 0) delete next[s.dateStr]
                      else next[s.dateStr] = set
                      return next
                    })
                  }} className="ml-1 hover:text-red-500 transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cost + actions */}
        <div className="flex items-center gap-4">
          {costPreview > 0 && (
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-xl border border-primary-100">
              <DollarSign size={16} className="text-primary-600 shrink-0" />
              <span className="text-sm text-primary-800 font-medium">Dự kiến:</span>
              <span className="text-base font-bold text-primary-700 ml-auto">{costPreview.toLocaleString('vi-VN')}₫</span>
              <span className="text-xs text-primary-500">({totalHours}h)</span>
            </div>
          )}
          <Button type="button" variant="secondary" className="shrink-0" onClick={onClose}>Hủy</Button>
          <Button type="button" variant="primary" className="shrink-0 min-w-[130px]" loading={loading} onClick={onSubmit}>
            Xác nhận đặt lịch
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function WorkspaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workspace,    setWorkspace]    = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [bookingOpen,  setBookingOpen]  = useState(false)
  const [location, setLocation] = useState(null)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  useEffect(() => {
    setLoading(true)
    workspaceService.getById(id)
      .then(async (d) => {
        setWorkspace(d)
        if (d.locationId) {
          try {
            const loc = await locationService.getById(d.locationId)
            setLocation(loc)
          } catch (e) { console.error('Failed to load location', e) }
        }
      })
      .catch(() => navigate('/locations'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner />
  if (!workspace) return null

  const images = []
  if (workspace.thumbnailUrl) images.push({ id: 'thumb', url: workspace.thumbnailUrl })
  if (workspace.ListImageUrl) {
    workspace.ListImageUrl.forEach((img) => {
      if (!images.find(i => i.url === img.url)) images.push(img)
    })
  }
  const hasImages = images.length > 0
  const currentImage = hasImages ? images[currentImgIndex]?.url : null

  const isAvailable = workspace.status === WORKSPACE_STATUS.ACTIVE
  const meta        = STATUS_META[workspace.status] || STATUS_META.ACTIVE

  const equipmentList = workspace.equipment
    ? workspace.equipment.split(',').map(e => e.trim()).filter(Boolean)
    : []

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/locations" className="hover:text-gray-700 transition-colors">Locations</Link>
            {location && (
              <><ChevronRight size={12} />
              <Link to={`/locations/${location.id}`} className="hover:text-gray-700 transition-colors">
                {location.name}
              </Link></>
            )}
            <ChevronRight size={12} />
            <span className="text-gray-700">Room {workspace.roomNumber}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div>
              {location && (
                <p className="text-base font-semibold text-primary-600 mb-2 flex items-center gap-2 tracking-wide uppercase">
                  <Building2 size={18} /> {location.name}
                </p>
              )}
              <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">Room {workspace.roomNumber}</h1>
              <div className="flex items-center gap-3">
                <span className="text-base text-gray-600 font-medium">
                  {WORKSPACE_TYPE_LABEL[workspace.type]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-base text-gray-600 flex items-center gap-1.5 font-medium">
                  <MapPin size={16} /> Floor {workspace.floor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery Slider */}
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-4 relative h-[350px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                {currentImage ? (
                  <img src={currentImage} alt={`Room ${workspace.roomNumber}`} className="w-full h-full object-cover transition-opacity duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200"><Building2 size={48} /></div>
                )}
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-800 flex items-center justify-center shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-800 flex items-center justify-center shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium tracking-wide">
                      {currentImgIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && images.slice(0, 4).map((img, idx) => (
                <div key={img.id || idx} onClick={() => setCurrentImgIndex(idx)}
                  className={cn(
                    "relative h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                    currentImgIndex === idx ? "border-primary-500 opacity-100" : "border-gray-100 opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-lg">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
              <p className="font-semibold text-gray-900 mb-6 text-lg">Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Capacity', value: `${workspace.capacity} people`, icon: <Users size={24} /> },
                  { label: 'Area',     value: `${workspace.acreage} m²`,     icon: <Building2 size={24} /> },
                  { label: 'Floor',    value: `Floor ${workspace.floor}`,    icon: <MapPin size={24} /> },
                ].map((spec) => (
                  <div key={spec.label} className="p-5 rounded-xl bg-gray-50 border border-gray-100 text-center flex flex-col items-center justify-center gap-2 hover:border-primary-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-1 text-primary-600">{spec.icon}</div>
                    <p className="font-bold text-gray-900 text-base">{spec.value}</p>
                    <p className="text-sm text-gray-500">{spec.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {equipmentList.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
                <p className="font-semibold text-gray-900 mb-6 text-lg">Amenities & Equipment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {equipmentList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-5 rounded-xl bg-gray-50 border border-gray-100 group hover:border-primary-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-400 shrink-0" />
                      <span className="text-base text-gray-800 font-medium group-hover:text-primary-700 transition-colors">{item}</span>
                      <CheckCircle size={20} className="ml-auto text-success-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {location && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-lg">Location Map</p>
                  <p className="text-base text-gray-500 mt-2">{location.name}, {location.ward}</p>
                </div>
                <div className="w-full h-[400px] bg-gray-100 relative">
                  <iframe 
                    title="Google Map"
                    className="absolute inset-0 w-full h-full border-0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${location.name}, ${location.ward}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 sticky top-20">
              {!isAvailable && (
                <div className="flex items-center gap-2.5 mb-5 bg-orange-50 text-orange-700 px-4 py-3 rounded-xl border border-orange-100">
                  <span className={cn('w-2.5 h-2.5 rounded-full', meta.dot)} />
                  <span className="text-sm font-semibold">{WORKSPACE_STATUS_LABEL[workspace.status]}</span>
                  <span className="ml-auto text-xs opacity-80">Currently unavailable</span>
                </div>
              )}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-base text-gray-500 mb-2">Price per hour</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-bold text-gray-900 leading-none">
                    {workspace.pricePerHour?.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <Button variant={isAvailable ? 'primary' : 'secondary'} className="w-full py-4 text-lg font-semibold"
                disabled={!isAvailable} onClick={() => isAvailable && setBookingOpen(true)}>
                {isAvailable ? 'Book this workspace' : 'Not available'}
              </Button>

              {location && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Location</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                      <p className="text-xs text-gray-500 truncate">{location.ward}</p>
                    </div>
                  </div>
                  <Link to={`/locations/${location.id}`}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    See all spaces <ChevronRight size={11} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal workspace={workspace} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
