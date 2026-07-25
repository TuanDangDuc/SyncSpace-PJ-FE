import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X, Plus, Edit2, Trash2, Building2, RefreshCw, MapPin, Eye } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { showToast } from '@/utils/toast'
import workspaceService from '@/services/workspaceService'
import locationService from '@/services/locationService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { cn } from '@/utils/cn'
import { WORKSPACE_TYPE, WORKSPACE_TYPE_LABEL, WORKSPACE_STATUS, WORKSPACE_STATUS_LABEL, STATUS_META } from '@/utils/constants'

const typeOptions   = Object.entries(WORKSPACE_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))
const statusOptions = Object.entries(WORKSPACE_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))

function WorkspaceFormModal({ open, onClose, onSuccess, editing, locations }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm()
  
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])

  useEffect(() => {
    reset(editing ? {
      floor: editing.floor, roomNumber: editing.roomNumber, type: editing.type,
      acreage: editing.acreage, capacity: editing.capacity, equipment: editing.equipment,
      pricePerHour: editing.pricePerHour,
      status: editing.status, locationId: editing.locationId
    } : {})
    setSelectedFiles([])
    setExistingImages(editing?.ListImageUrl?.map(img => typeof img === 'string' ? img : img.url) || [])
  }, [editing, open, reset])

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])
    }
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let finalThumbnailUrl = editing?.thumbnailUrl || null
      if (data.thumbnailFile && data.thumbnailFile.length > 0) {
        const formData = new FormData()
        formData.append('file', data.thumbnailFile[0])
        const uploadedUrls = await workspaceService.uploadImages(formData)
        if (uploadedUrls && uploadedUrls.length > 0) {
          finalThumbnailUrl = uploadedUrls[0]
        }
      }

      if (!finalThumbnailUrl) {
        showToast.error("Thumbnail Image is required")
        setLoading(false)
        return
      }

      let uploadedUrls = []
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach((f) => formData.append('file', f))
        uploadedUrls = await workspaceService.uploadImages(formData)
      }

      const allImages = [...existingImages, ...uploadedUrls].map(img => ({ 
        url: typeof img === 'string' ? img : (img.url || img) 
      }))

      const payload = {
        floor:       Number(data.floor),
        roomNumber:  data.roomNumber,
        type:        data.type,
        acreage:     Number(data.acreage),
        capacity:    Number(data.capacity),
        pricePerHour: Number(data.pricePerHour),
        equipment:   data.equipment,
        status:      data.status || 'ACTIVE',
        locationId:  data.locationId,
        thumbnailUrl: finalThumbnailUrl,
        images:      allImages,
      }
      editing ? await workspaceService.update(editing.id, payload) : await workspaceService.create(payload)
      showToast.success(editing ? 'Workspace updated' : 'Workspace created')
      onSuccess(); onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.defaultMessage || 'Operation failed'
      showToast.error(msg)
    } finally { setLoading(false) }
  }

  const locOpts = useMemo(() => locations.map((l) => ({ value: l.id, label: l.name })), [locations])

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit workspace' : 'Add workspace'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <Input label="Room number" placeholder="e.g. A101" error={errors.roomNumber?.message}
            {...register('roomNumber', { required: 'Required' })} />
          <Input label="Floor" type="number" placeholder="1" error={errors.floor?.message}
            {...register('floor', { required: 'Required' })} />
          <Select label="Type" options={typeOptions} placeholder="Select type" error={errors.type?.message}
            {...register('type', { required: 'Required' })} />
          <Select label="Status" options={statusOptions} placeholder="Select status" {...register('status')} />
          <Input label="Capacity (people)" type="number" error={errors.capacity?.message}
            {...register('capacity', { required: 'Required' })} />
          <Input label="Area (m²)" type="number" error={errors.acreage?.message}
            {...register('acreage', { required: 'Required' })} />
          <Input label="Price per hour (₫)" type="number" error={errors.pricePerHour?.message}
            {...register('pricePerHour', { required: 'Required', min: { value: 0, message: 'Must be positive' } })} />
          <Input label="Equipment" placeholder="e.g. Wifi, Projector" error={errors.equipment?.message}
            {...register('equipment', { required: 'Required' })} />
          <Controller
            name="locationId"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <SearchableSelect
                label="Location"
                options={locOpts}
                placeholder="Select location"
                error={errors.locationId?.message}
                value={field.value}
                onChange={field.onChange}
                wrapperClassName="col-span-2 sm:col-span-2"
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thumbnail Image (1 file)</label>
            <input type="file" accept="image/*" {...register('thumbnailFile')}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-150 rounded-lg p-1 mt-0.5"
            />
            {editing?.thumbnailUrl && (
              <p className="text-xs text-gray-400 mt-1 truncate">Current: {editing.thumbnailUrl}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Images (Multiple)</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-150 rounded-lg p-1 mt-0.5"
            />
          </div>
        </div>

        {/* Preview Selected/Existing Images */}
        {(existingImages.length > 0 || selectedFiles.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-150">
            <p className="text-xs font-semibold text-gray-500 mb-2">Gallery Preview ({existingImages.length + selectedFiles.length} images)</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((url, idx) => (
                <div key={`exist-${idx}`} className="relative group">
                  <img src={url} alt="Workspace" className="w-14 h-14 object-cover rounded-md border border-gray-200" />
                  <button type="button" onClick={() => removeExistingImage(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-danger-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-600 shadow-sm">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {selectedFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-14 h-14 object-cover rounded-md border border-primary-200 opacity-80" />
                  <button type="button" onClick={() => removeSelectedFile(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-danger-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-600 shadow-sm">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default function AdminWorkspacesPage() {
  const [allWorkspaces, setAllWorkspaces] = useState([])
  const [locations,     setLocations]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [query,         setQuery]         = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [locFilter,     setLocFilter]     = useState('')
  const [page,          setPage]          = useState(1)
  const [formOpen,      setFormOpen]      = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [deleteId,     setDeleteId]     = useState(null)
  const [viewingDetail, setViewingDetail] = useState(null)

  useEffect(() => {
    locationService.getAll({ page: 0, size: 200 })
      .then((d) => setLocations(d?.content ?? d?.result?.content ?? []))
  }, [])

  const fetchWorkspaces = useCallback(() => {
    setLoading(true)
    workspaceService.getAll({ page: 0, size: 200 })
      .then((d) => {
        setAllWorkspaces(d?.content ?? d?.result?.content ?? [])
      })
      .catch(() => setAllWorkspaces([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchWorkspaces() }, [fetchWorkspaces])

  // Filter
  const filtered = allWorkspaces.filter(ws => 
    (!query        || ws.roomNumber?.toLowerCase().includes(query.toLowerCase())) &&
    (!typeFilter   || ws.type === typeFilter) &&
    (!statusFilter || ws.status === statusFilter) &&
    (!locFilter    || ws.locationId === locFilter)
  )

  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize) || 1

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const workspaces = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleDelete = async (id) => {
    try { await workspaceService.delete(id); showToast.success('Deleted'); fetchWorkspaces() }
    catch (err) { showToast.error(err.response?.data?.message || 'Delete failed') }
    setDeleteId(null)
  }

  // toggleStatus: update full workspace with toggled status
  const handleToggleStatus = async (ws) => {
    const next = ws.status === WORKSPACE_STATUS.ACTIVE ? WORKSPACE_STATUS.MAINTENANCE : WORKSPACE_STATUS.ACTIVE
    try {
      await workspaceService.update(ws.id, { ...ws, status: next, locationId: ws.locationId })
      showToast.success(`Status → ${next}`)
      fetchWorkspaces()
    } catch (err) { showToast.error(err.response?.data?.message || 'Failed') }
  }

  const locOpts = useMemo(() => [
    { value: '', label: 'All locations' }, 
    ...locations.map((l) => ({ value: l.id, label: l.name }))
  ], [locations])

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workspaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all workspace units</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}
          onClick={() => { setEditing(null); setFormOpen(true) }}>
          Add workspace
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Input placeholder="Search room…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          icon={<Search size={14} />}
          iconRight={query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          wrapperClassName="w-44" />
        <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          options={[{ value: '', label: 'All types' }, ...typeOptions]} wrapperClassName="w-40" />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          options={[{ value: '', label: 'All statuses' }, ...statusOptions]} wrapperClassName="w-40" />
        <Select value={locFilter} onChange={(e) => { setLocFilter(e.target.value); setPage(1) }}
          options={locOpts} wrapperClassName="w-44" />
        <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={fetchWorkspaces} className="ml-auto" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Workspace', 'Location', 'Price/hr', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td>
                    ))}</tr>
                  ))
                : workspaces.length === 0
                  ? <tr><td colSpan={5}><EmptyState icon={<Building2 size={24} />} title="No workspaces" className="py-16" /></td></tr>
                  : workspaces.map((w) => {
                    const meta = STATUS_META[w.status] || STATUS_META.ACTIVE
                    return (
                      <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            {w.thumbnailUrl ? (
                              <img src={w.thumbnailUrl} alt={w.roomNumber} loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100 shadow-sm">
                                <Building2 size={20} className="text-primary-600" />
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-gray-900 text-base whitespace-nowrap">Room {w.roomNumber}</span>
                              <span className="text-sm font-medium text-gray-500">{WORKSPACE_TYPE_LABEL[w.type]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary-500 shrink-0" />
                            <span className="text-base font-medium text-gray-700 max-w-[200px] leading-snug">
                              {w.location?.name ?? locations.find(l => l.id === w.locationId)?.name ?? '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-base font-bold text-primary-600 whitespace-nowrap">
                          {w.pricePerHour?.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggleStatus(w)}>
                            <span className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity', (STATUS_META[w.status] || STATUS_META.ACTIVE).badge)}>
                              <span className={cn('w-2 h-2 rounded-full', (STATUS_META[w.status] || STATUS_META.ACTIVE).dot)} />
                              {WORKSPACE_STATUS_LABEL[w.status]}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingDetail(w)}
                              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Details">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => { setEditing(w); setFormOpen(true) }}
                              className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteId(w.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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

      <WorkspaceFormModal open={formOpen} onClose={() => setFormOpen(false)}
        onSuccess={fetchWorkspaces} editing={editing} locations={locations} />

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete workspace" size="sm">
        <div className="flex flex-col items-center text-center py-3">
          <div className="w-12 h-12 rounded-full bg-danger-50 border border-danger-100 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-danger-600" />
          </div>
          <p className="text-sm text-gray-600 mb-5">This workspace will be permanently deleted.</p>
          <div className="flex gap-2.5 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteId)}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewingDetail} onClose={() => setViewingDetail(null)} title="Workspace Details" size="lg">
        {viewingDetail && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                {viewingDetail.thumbnailUrl ? (
                  <img src={viewingDetail.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Room {viewingDetail.roomNumber}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">{WORKSPACE_TYPE_LABEL[viewingDetail.type]}</Badge>
                  <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border', (STATUS_META[viewingDetail.status] || STATUS_META.ACTIVE).badge)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', (STATUS_META[viewingDetail.status] || STATUS_META.ACTIVE).dot)} />
                    {WORKSPACE_STATUS_LABEL[viewingDetail.status]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-primary-500" />
                  <span>{viewingDetail.location?.name ?? locations.find(l => l.id === viewingDetail.locationId)?.name ?? '—'}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Floor</p>
                <p className="font-semibold text-gray-900">{viewingDetail.floor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Capacity</p>
                <p className="font-semibold text-gray-900">{viewingDetail.capacity} pax</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Area</p>
                <p className="font-semibold text-gray-900">{viewingDetail.acreage} m²</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price/hr</p>
                <p className="font-semibold text-primary-600">{viewingDetail.pricePerHour?.toLocaleString('vi-VN')}₫</p>
              </div>
            </div>

            {viewingDetail.equipment && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Equipment</h4>
                <p className="text-sm text-gray-600 bg-white border border-gray-150 p-3 rounded-lg leading-relaxed">
                  {viewingDetail.equipment}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Gallery</h4>
              {viewingDetail.ListImageUrl && viewingDetail.ListImageUrl.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {viewingDetail.ListImageUrl.map((img, idx) => (
                    <a key={idx} href={img.url || img} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                      <img src={img.url || img} alt={`Gallery ${idx}`} loading="lazy" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No additional images.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
