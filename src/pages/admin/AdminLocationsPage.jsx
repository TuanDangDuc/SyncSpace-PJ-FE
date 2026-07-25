import { useState, useEffect, useCallback } from 'react'
import { Search, X, Plus, Edit2, Trash2, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { showToast } from '@/utils/toast'
import locationService from '@/services/locationService'
import workspaceService from '@/services/workspaceService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'

function LocationFormModal({ open, onClose, onSuccess, editing }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    reset(editing ? { name: editing.name, ward: editing.ward, thumbnailUrl: editing.thumbnailUrl, description: editing.description } : { name: '', ward: '', thumbnailUrl: '', description: '' })
  }, [editing, open, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let finalThumbnailUrl = data.thumbnailUrl || ''
      if (data.file && data.file.length > 0) {
        const formData = new FormData()
        formData.append('file', data.file[0])
        const uploadedUrls = await workspaceService.uploadImages(formData)
        if (uploadedUrls && uploadedUrls.length > 0) {
          finalThumbnailUrl = uploadedUrls[0]
        }
      }

      const payload = { ...data, thumbnailUrl: finalThumbnailUrl }
      delete payload.file

      editing ? await locationService.update(editing.id, payload) : await locationService.create(payload)
      showToast.success(editing ? 'Location updated' : 'Location created')
      onSuccess(); onClose()
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Operation failed')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit location' : 'Add location'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" placeholder="e.g. SyncSpace Downtown" error={errors.name?.message}
          {...register('name', { required: 'Required' })} />
        <Input label="Ward / Address" placeholder="e.g. District 1, Ho Chi Minh City" error={errors.ward?.message}
          {...register('ward', { required: 'Required' })} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thumbnail Image (Optional)</label>
          <input type="file" accept="image/*" {...register('file')}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-150 rounded-lg p-1 mt-0.5"
          />
          {editing?.thumbnailUrl && (
            <p className="text-xs text-gray-400 mt-1 truncate">Current: {editing.thumbnailUrl}</p>
          )}
        </div>
        <Input label="Description" placeholder="Brief description about this location..." error={errors.description?.message}
          {...register('description')} />
        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteModal({ location, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    try {
      await locationService.delete(location.id)
      showToast.success('Location deleted')
      onSuccess(); onClose()
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Delete failed')
    } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Delete location" size="sm">
      <div className="flex flex-col items-center text-center py-3">
        <div className="w-12 h-12 rounded-full bg-danger-50 border border-danger-100 flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-danger-600" />
        </div>
        <p className="font-medium text-gray-900 mb-1">{location?.name}</p>
        <p className="text-sm text-gray-500 mb-5">All workspaces in this location may be affected.</p>
        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={handle}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminLocationsPage() {
  const [allLocations, setAllLocations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [query,        setQuery]        = useState('')
  const [page,         setPage]         = useState(1)
  const [formOpen,     setFormOpen]     = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchLocations = useCallback(() => {
    setLoading(true)
    locationService.getAll({ page: 0, size: 200 })
      .then((d) => {
        setAllLocations(d?.content ?? d?.result?.content ?? [])
      })
      .catch(() => setAllLocations([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  // Filter
  const filtered = allLocations.filter(loc => 
    !query || 
    loc.name?.toLowerCase().includes(query.toLowerCase()) || 
    loc.ward?.toLowerCase().includes(query.toLowerCase())
  )

  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize) || 1

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const locations = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage co-working space locations</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}
          onClick={() => { setEditing(null); setFormOpen(true) }}>
          Add location
        </Button>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <Input placeholder="Search locations…" value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          icon={<Search size={14} />}
          iconRight={query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          wrapperClassName="w-56" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Location', 'Ward', 'Description', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : locations.length === 0
                  ? <tr><td colSpan={5}><EmptyState icon={<MapPin size={22} />} title="No locations" className="py-12" /></td></tr>
                  : locations.map((loc, idx) => (
                    <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-4">
                          {loc.thumbnailUrl ? (
                            <img src={loc.thumbnailUrl} alt={loc.name} loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100 shadow-sm">
                              <MapPin size={20} className="text-primary-600" />
                            </div>
                          )}
                          <span className="font-semibold text-gray-900 text-sm">{loc.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{loc.ward}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed" title={loc.description}>
                          {loc.description || <span className="italic opacity-60">Chưa có mô tả</span>}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditing(loc); setFormOpen(true) }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(loc)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      <LocationFormModal open={formOpen} onClose={() => setFormOpen(false)} onSuccess={fetchLocations} editing={editing} />
      <DeleteModal location={deleteTarget} open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchLocations} />
    </div>
  )
}
