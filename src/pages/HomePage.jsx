import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, ArrowRight, Zap, Shield, Clock,
  Building2, Users, ChevronRight, Wifi, Coffee, Monitor, Car, Layers,
} from 'lucide-react'
import workspaceService from '@/services/workspaceService'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { WorkspaceCardSkeleton } from '@/components/ui/Skeleton'
import { WORKSPACE_TYPE_LABEL, WORKSPACE_STATUS, WORKSPACE_TYPE } from '@/utils/constants'
import { cn } from '@/utils/cn'

function WorkspaceCard({ workspace }) {
  const navigate = useNavigate()
  const isAvailable = workspace.status === WORKSPACE_STATUS.ACTIVE

  return (
    <div
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
      className="group cursor-pointer bg-white rounded-xl border border-gray-150 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-56 bg-gray-50 overflow-hidden">
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
              : 'bg-danger-500/90 text-white border-danger-400/50',
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', isAvailable ? 'bg-white' : 'bg-white')} />
            {isAvailable ? 'Available' : 'Occupied'}
          </span>
        </div>
        
        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-display font-semibold text-xl leading-tight mb-1 drop-shadow-md">
            Room {workspace.roomNumber}
          </p>
          <p className="text-sm text-white/90 drop-shadow-md font-medium flex items-center gap-1">
            <MapPin size={13} /> Floor {workspace.floor}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-medium">
              <Users size={14} strokeWidth={2} /> {workspace.capacity} ppl
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
              <Layers size={14} strokeWidth={2} /> {workspace.acreage} m²
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
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
        </div>
        
        <div className="mt-auto">
          <button className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
            Book Workspace <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

const typeOptions = [
  { value: 'ALL',                            label: 'All types' },
  { value: WORKSPACE_TYPE.MEETING_ROOM,      label: 'Meeting Room' },
  { value: WORKSPACE_TYPE.PRIVATE_OFFICE,    label: 'Private Office' },
  { value: WORKSPACE_TYPE.SHARED_OFFICE,     label: 'Shared Office' },
  { value: WORKSPACE_TYPE.CONFERENCE_ROOM,   label: 'Conference Room' },
  { value: WORKSPACE_TYPE.CREATIVE_STUDIO,   label: 'Creative Studio' },
  { value: WORKSPACE_TYPE.TRAINING_ROOM,     label: 'Training Room' },
  { value: WORKSPACE_TYPE.OPEN_OFFICE,       label: 'Open Office' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [query,       setQuery]       = useState('')
  const [workspaces,  setWorkspaces]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [typeFilter,  setTypeFilter]  = useState('ALL')

  useEffect(() => {
    workspaceService.getAll({ page: 0, size: 8 })
      .then((d) => setWorkspaces(d?.content ?? []))
      .catch(() => setWorkspaces([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = typeFilter === 'ALL' ? workspaces : workspaces.filter((w) => w.type === typeFilter)

  return (
    <div className="animate-fade-in">

      {/* ── HERO ── */}
      <section className="relative border-b border-gray-150 overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
        {/* Subtle warm gradient blob */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 80% 20%, rgba(194,113,79,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 80%, rgba(74,124,89,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="page-container py-24 lg:py-32 relative z-10">
          <div className="max-w-2xl mx-auto text-center">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full status-available" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Real-time availability
              </span>
            </div>

            {/* Headline — serif */}
            <h1 className="font-display font-semibold text-gray-900 leading-[1.08] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}>
              Book your workspace,<br />
              <em className="font-display italic text-primary-500 not-italic">in seconds.</em>
            </h1>

            <p className="text-gray-500 text-lg mb-9 max-w-md mx-auto leading-relaxed">
              Real-time availability across all locations. No back-and-forth, no conflicts.
            </p>

            {/* Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); navigate(`/locations?q=${encodeURIComponent(query)}`) }}
              className="flex items-center gap-2 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search location or workspace type…"
                  className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all hover:border-gray-300"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="shrink-0">
                Search
              </Button>
            </form>

            {/* Quick tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['Meeting Room', 'Private Office', 'Shared Office', 'Conference Room'].map((tag) => (
                <button key={tag}
                  onClick={() => navigate(`/locations?type=${tag.replace(/ /g, '_').toUpperCase()}`)}
                  className="tag hover:bg-gray-100 transition-colors cursor-pointer">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="max-w-sm mx-auto mt-16 grid grid-cols-3 divide-x divide-gray-150 border border-gray-150 rounded-lg overflow-hidden bg-white"
            style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
            {[
              { value: '50+',  label: 'Locations' },
              { value: '500+', label: 'Workspaces' },
              { value: '10k+', label: 'Bookings' },
            ].map((s) => (
              <div key={s.label} className="px-6 py-5 text-center">
                <p className="font-display font-semibold text-gray-900 text-2xl">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 border-b border-gray-150" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why SyncSpace</p>
            <h2 className="font-display font-semibold text-gray-900 text-[2rem] mb-3">
              Built for real teams
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Enterprise-grade infrastructure behind an interface that just works.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Zap size={17} strokeWidth={1.5} />,      title: 'Real-time SSE',      desc: 'Workspace status updates instantly for every user — no refresh needed.',       accent: '#C2714F' },
              { icon: <Shield size={17} strokeWidth={1.5} />,   title: 'No Race Conditions', desc: 'Kafka + Optimistic Locking guarantees conflict-free concurrent bookings.',       accent: '#4A7C59' },
              { icon: <Clock size={17} strokeWidth={1.5} />,    title: '< 5ms Reads',        desc: 'Redis Cache-Aside strategy reduces hot-data latency by 20×.',                   accent: '#B45309' },
              { icon: <Building2 size={17} strokeWidth={1.5}/>, title: 'Microservices',      desc: 'Booking & Notification services deployed independently on Kubernetes.',          accent: '#3D6FA0' },
              { icon: <Wifi size={17} strokeWidth={1.5} />,     title: 'Auto-scaling',       desc: 'K8s HPA scales pods under load — zero manual intervention.',                    accent: '#7A5C9E' },
              { icon: <Car size={17} strokeWidth={1.5} />,      title: 'CI/CD Ready',        desc: 'GitHub Actions + Docker pipelines for every service, every push.',              accent: '#8B6914' },
            ].map((f) => (
              <div key={f.title}
                className="bg-white rounded-lg border border-gray-150 p-5 group hover:-translate-y-0.5 transition-all duration-200"
                style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
                <div className="w-9 h-9 rounded border flex items-center justify-center mb-4 transition-colors"
                  style={{ borderColor: `${f.accent}25`, backgroundColor: `${f.accent}0D`, color: f.accent }}>
                  {f.icon}
                </div>
                <p className="font-semibold text-gray-900 mb-1.5 text-sm">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKSPACES ── */}
      <section className="py-20 border-b border-gray-150 bg-[#FAF9F6]">
        <div className="page-container">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-label mb-2">Live Inventory</p>
              <h2 className="font-display font-semibold text-gray-900 text-[2rem]">
                Featured workspaces
              </h2>
            </div>
            <Link to="/locations" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors shrink-0 group">
              View all <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-1.5 flex-wrap mb-7">
            {typeOptions.map((opt) => (
              <button key={opt.value} onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-sm font-medium transition-all border',
                  typeFilter === opt.value
                    ? 'bg-primary-500 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-75 hover:border-gray-300',
                )}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <WorkspaceCardSkeleton key={i} />)
              : filtered.slice(0, 8).map((w) => <WorkspaceCard key={w.id} workspace={w} />)
            }
          </div>

          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-14">No workspaces for this type.</p>
          )}

          <div className="text-center mt-10">
            <Button variant="secondary" size="lg" onClick={() => navigate('/locations')}
              iconRight={<ArrowRight size={15} />}>
              Browse all locations
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="page-container">
          <div className="max-w-xl mx-auto text-center">
            {/* Decorative line */}
            <div className="flex items-center gap-4 justify-center mb-8">
              <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
              <span className="section-label">Get started</span>
              <div className="h-px bg-gray-200 flex-1 max-w-[80px]" />
            </div>

            <h2 className="font-display font-semibold text-gray-900 text-[2rem] mb-3">
              Find your workspace
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Join thousands of professionals booking smarter with SyncSpace.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button variant="primary" size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={15} />}>
                Get started free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/locations')}>
                Browse locations
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
