import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, ChevronRight, Users, Building2, Wifi, Coffee, Monitor, Car, Search, X } from 'lucide-react'
import locationService from '@/services/locationService'
import workspaceService from '@/services/workspaceService'
import Button from '@/components/ui/Button'
import { WorkspaceCardSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { WORKSPACE_TYPE_LABEL, WORKSPACE_STATUS, WORKSPACE_STATUS_LABEL, STATUS_META } from '@/utils/constants'
import { cn } from '@/utils/cn'

function WorkspaceCard({ workspace, onBook }) {
  const isAvailable   = workspace.status === WORKSPACE_STATUS.ACTIVE
  const isMaintenance = workspace.status === WORKSPACE_STATUS.MAINTENANCE
  const meta          = STATUS_META[workspace.status] || STATUS_META.ACTIVE

  return (
    <div className="group bg-white rounded-xl border border-gray-150 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-56 bg-gray-50 overflow-hidden cursor-pointer" onClick={() => window.open(`/workspaces/${workspace.id}`, '_self')}>
        {workspace.thumbnailUrl ? (
          <>
            <img src={workspace.thumbnailUrl} alt={workspace.roomNumber} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <Building2 size={40} strokeWidth={1.5} className="mb-2 text-gray-400" />
            <span className="text-sm text-gray-400 font-medium">No Image</span>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-black/40 text-white backdrop-blur-md border border-white/20">
            {WORKSPACE_TYPE_LABEL[workspace.type] || workspace.type}
          </span>
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase backdrop-blur-md border shadow-sm',
            isAvailable
              ? 'bg-success-500/90 text-white border-success-400/50'
              : meta.badge === 'badge-warning' ? 'bg-warning-500/90 text-white border-warning-400/50' : 'bg-danger-500/90 text-white border-danger-400/50'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', 'bg-white')} />
            {WORKSPACE_STATUS_LABEL[workspace.status]}
          </span>
        </div>
        
        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-display font-semibold text-xl leading-tight mb-1 drop-shadow-md group-hover:text-primary-300 transition-colors">
            Room {workspace.roomNumber}
          </p>
          <p className="text-sm text-white/90 drop-shadow-md font-medium flex items-center gap-1">
            <MapPin size={13} /> Floor {workspace.floor}
          </p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-medium">
            <Users size={14} strokeWidth={2} /> {workspace.capacity} ppl
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
            <Building2 size={14} strokeWidth={2} /> {workspace.acreage} m²
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-5 line-clamp-2 h-[40px] leading-relaxed flex-1">
          {workspace.equipment || <span className="italic text-gray-400">Không có thông tin thiết bị</span>}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-4">
          <div className="flex gap-2">
            {[Wifi, Coffee, Monitor].map((Icon, i) => (
              <div key={i} className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
                <Icon size={14} strokeWidth={2} />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Price</p>
            <p className="font-bold text-gray-900 text-lg">
              {workspace.pricePerHour?.toLocaleString('vi-VN')}₫
              <span className="text-xs text-gray-400 font-normal ml-0.5">/hr</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <Button variant="secondary" className="flex-1 text-sm font-medium hover:border-gray-300"
            onClick={() => window.open(`/workspaces/${workspace.id}`, '_self')}>
            Details
          </Button>
          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            className="flex-1 text-sm font-medium"
            disabled={!isAvailable}
            onClick={() => isAvailable && onBook(workspace)}
          >
            {isMaintenance ? 'Maintenance' : isAvailable ? 'Book' : 'Occupied'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function LocationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [location,   setLocation]   = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      locationService.getById(id), 
      workspaceService.getByLocation(id, { page: 0, size: 50 })
    ])
      .then(([locData, wsData]) => {
        setLocation(locData)
        setWorkspaces(Array.isArray(wsData) ? wsData : (wsData?.content ?? []))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const filtered = workspaces.filter((w) =>
    (!typeFilter   || w.type === typeFilter) &&
    (!statusFilter || w.status === statusFilter) &&
    (!query        || w.roomNumber?.toLowerCase().includes(query.toLowerCase()))
  )

  const active      = workspaces.filter(w => w.status === WORKSPACE_STATUS.ACTIVE).length
  const maintenance = workspaces.filter(w => w.status === WORKSPACE_STATUS.MAINTENANCE).length
  const inactive    = workspaces.filter(w => w.status === WORKSPACE_STATUS.INACTIVE).length

  const typeOptions   = [{ value: '', label: 'All types' }, ...Object.entries(WORKSPACE_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))]
  const statusOptions = [{ value: '', label: 'All statuses' }, ...Object.entries(WORKSPACE_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/locations" className="hover:text-gray-700 transition-colors">Locations</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700">{location?.name ?? '…'}</span>
          </nav>

          {loading ? (
            <div className="space-y-2">
              <div className="h-7 w-48 bg-gray-100 rounded shimmer" />
              <div className="h-4 w-32 bg-gray-100 rounded shimmer" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {location?.thumbnailUrl && (
                  <img src={location.thumbnailUrl} alt={location.name} loading="lazy" className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-sm" />
                )}
                <div className="flex flex-col justify-center h-full pt-1">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">{location?.name}</h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2.5">
                    <MapPin size={13} />{location?.ward}
                  </p>
                  {location?.description && (
                    <p className="text-sm text-gray-600 max-w-xl leading-relaxed">{location.description}</p>
                  )}
                </div>
              </div>

              {/* Live stats */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <div>
                  <p className="text-lg font-semibold text-success-600">{active}</p>
                  <p className="text-[11px] text-gray-500">Active</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-lg font-semibold text-warning-600">{maintenance}</p>
                  <p className="text-[11px] text-gray-500">Maintenance</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-lg font-semibold text-danger-600">{inactive}</p>
                  <p className="text-[11px] text-gray-500">Inactive</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full status-available mb-1" />
                  <p className="text-[11px] text-success-600 font-medium">Live</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page-container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          <Input placeholder="Search room…" value={query} onChange={(e) => setQuery(e.target.value)}
            icon={<Search size={14} />}
            iconRight={query && <button onClick={() => setQuery('')}><X size={13} /></button>}
            wrapperClassName="w-48" />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            options={typeOptions} wrapperClassName="w-40" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions} wrapperClassName="w-40" />
          {(typeFilter || statusFilter || query) && (
            <Button variant="ghost" size="sm" icon={<X size={13} />}
              onClick={() => { setTypeFilter(''); setStatusFilter(''); setQuery('') }}>
              Clear
            </Button>
          )}
          <span className="self-center text-xs text-gray-500 ml-auto">
            {!loading && `${filtered.length} workspace${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <WorkspaceCardSkeleton key={i} />)
            : filtered.map((w) => <WorkspaceCard key={w.id} workspace={w} onBook={(ws) => navigate(`/workspaces/${ws.id}`)} />)
          }
        </div>
        {!loading && filtered.length === 0 && (
          <EmptyState icon={<Building2 size={22} />} title="No workspaces found"
            description="Adjust your filters to see more results."
            action={<Button variant="secondary" size="sm" onClick={() => { setTypeFilter(''); setStatusFilter(''); setQuery('') }}>Reset</Button>}
          />
        )}
      </div>
    </div>
  )
}
