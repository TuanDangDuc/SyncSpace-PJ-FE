import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Search, Building2, ChevronRight, X } from 'lucide-react'
import locationService from '@/services/locationService'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'

function LocationCard({ location }) {
  return (
    <Link to={`/locations/${location.id}`}
      className="group block bg-white rounded-xl border border-gray-150 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >

      {/* Map header — warm grid pattern */}
      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: '#F5F1EB' }}>
        {location.thumbnailUrl ? (
          <>
            <img src={location.thumbnailUrl} alt={location.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage: 'linear-gradient(#D9D0C5 1px, transparent 1px), linear-gradient(90deg, #D9D0C5 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border border-primary-200 bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                <MapPin size={24} className="text-primary-500" strokeWidth={1.5} />
              </div>
            </div>
          </>
        )}
        
        {location.workspaceCount != null && (
          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-white/95 text-gray-900 shadow-sm border border-gray-200/50 backdrop-blur-md flex items-center gap-1.5">
              <Building2 size={14} className="text-primary-600" />
              {location.workspaceCount} spaces
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors line-clamp-1 mb-1.5">
          {location.name}
        </h3>
        <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate mb-3">
          <MapPin size={14} className="shrink-0 text-gray-400" strokeWidth={2} />{location.ward}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 h-[40px] mb-5 leading-relaxed flex-1">
          {location.description || <span className="italic opacity-50">No description available</span>}
        </p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
          <div className="flex gap-2 flex-wrap">
            {['Meeting', 'Desk', 'Office'].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                {t}
              </span>
            ))}
          </div>
          <span className="text-sm text-primary-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Explore <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function LocationCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-150 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function LocationsPage() {
  const [searchParams]                = useSearchParams()
  const [locations, setLocations]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [query, setQuery]             = useState(searchParams.get('q') || '')
  const [debouncedQ, setDebouncedQ]   = useState(query)
  const [page, setPage]               = useState(1) // frontend uses 1-indexed for Pagination UI
  const [totalPages, setTotalPages]   = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      // Chỉ search nếu >= 2 ký tự hoặc rỗng
      if (query.length >= 2 || query.length === 0) {
        setDebouncedQ(query)
        setPage(1) // Reset về trang đầu mỗi khi search thay đổi
      }
    }, 400) // 400ms debounce
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setLoading(true)
    locationService.getAll({ page: page - 1, size: 9, search: debouncedQ, ward: debouncedQ })
      .then((d) => {
        setLocations(d?.content ?? d?.result?.content ?? [])
        setTotalPages(d?.page?.totalPages ?? d?.totalPages ?? 1)
      })
      .catch(() => setLocations([]))
      .finally(() => setLoading(false))
  }, [debouncedQ, page])

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="bg-[#FAF9F6] border-b border-gray-150">
        <div className="page-container py-12">
          <p className="section-label mb-3">Locations</p>
          <h1 className="font-display font-semibold text-gray-900 text-[2rem] mb-2">
            Find a workspace near you
          </h1>
          <p className="text-gray-500 text-sm mb-6">All co-working locations with live availability.</p>

          <div className="max-w-sm">
            <Input
              placeholder="Search by name or ward…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search size={15} strokeWidth={1.5} />}
              iconRight={query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            />
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {!loading && (
          <p className="text-xs text-gray-400 mb-5">
            {locations.length} location{locations.length !== 1 ? 's' : ''} found
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <LocationCardSkeleton key={i} />)
            : locations.map((loc) => <LocationCard key={loc.id} location={loc} />)
          }
        </div>
        {!loading && locations.length === 0 && (
          <EmptyState icon={<MapPin size={22} strokeWidth={1.5} />} title="No locations found"
            description={query ? `No results for "${query}".` : 'No locations available yet.'}
            action={query && (
              <button onClick={() => setQuery('')} className="text-sm text-primary-600 hover:underline">Clear search</button>
            )}
          />
        )}
        
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
