import { useState, useEffect, useCallback } from 'react'
import { Search, X, MoreVertical, Shield, Ban, CheckCircle, Trash2, UserPlus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { showToast } from '@/utils/toast'
import adminService from '@/services/adminService'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'
import { USER_STATUS, USER_STATUS_LABEL, USER_ROLE } from '@/utils/constants'

const statusVariant = { ACTIVE: 'success', INACTIVE: 'danger' }
const roleVariant   = { ADMIN: 'violet', USER: 'primary' }

function fmt(dt) {
  try { return format(parseISO(dt), 'dd MMM yyyy') } catch { return '—' }
}

function UserActionMenu({ user, onStatusChange, onRoleChange, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-dropdown py-1 z-20 animate-slide-up">
            {user.status !== USER_STATUS.ACTIVE && (
              <button onClick={() => { onStatusChange(user.username, USER_STATUS.ACTIVE); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-success-600 hover:bg-success-50 transition-colors">
                <CheckCircle size={14} /> Activate
              </button>
            )}
            {user.status !== USER_STATUS.INACTIVE && (
              <button onClick={() => { onStatusChange(user.username, USER_STATUS.INACTIVE); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warning-600 hover:bg-warning-50 transition-colors">
                <Ban size={14} /> Deactivate
              </button>
            )}
            {user.role !== USER_ROLE.ADMIN && (
              <button onClick={() => { onRoleChange(user.username, USER_ROLE.ADMIN); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 transition-colors">
                <Shield size={14} /> Make admin
              </button>
            )}
            {user.role !== USER_ROLE.USER && (
              <button onClick={() => { onRoleChange(user.username, USER_ROLE.USER); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors">
                <Shield size={14} /> Set user
              </button>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button onClick={() => { onDelete(user); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function DeleteModal({ user, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    try {
      await adminService.deleteUser(user.username)
      showToast.success(`"${user.username}" deleted`)
      onSuccess(); onClose()
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Delete failed')
    } finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Delete user" size="sm">
      <div className="flex flex-col items-center text-center py-3">
        <div className="w-12 h-12 rounded-full bg-danger-50 border border-danger-100 flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-danger-600" />
        </div>
        <p className="font-medium text-gray-900 mb-1">{user?.username}</p>
        <p className="text-sm text-gray-500 mb-5">This action is permanent and cannot be undone.</p>
        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminUsersPage() {
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [query,        setQuery]        = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const PAGE_SIZE = 10

  const fetchUsers = useCallback(() => {
    setLoading(true)
    adminService.getUsers({ page: page - 1, size: PAGE_SIZE })
      .then((d) => {
        // Backend pagination: { content: [], page: { totalPages, ... } }
        setUsers(d?.content ?? [])
        setTotalPages(d?.page?.totalPages ?? 1)
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleStatusChange = async (username, status) => {
    try { await adminService.updateUserStatus(username, status); showToast.success('Status updated'); fetchUsers() }
    catch (err) { showToast.error(err.response?.data?.message || 'Failed') }
  }
  const handleRoleChange = async (username, role) => {
    try { await adminService.updateUserRole(username, role); showToast.success('Role updated'); fetchUsers() }
    catch (err) { showToast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage all registered accounts</p>
      </div>

      {/* Filters — note: backend /api/user does not support search/role/status query params */}
      <div className="flex flex-wrap gap-2.5">
        <Input placeholder="Search name…" value={query}
          onChange={(e) => { setQuery(e.target.value) }}
          icon={<Search size={14} />}
          iconRight={query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
          wrapperClassName="w-56" />
        {query && (
          <Button variant="ghost" size="sm" icon={<X size={13} />}
            onClick={() => { setQuery(''); setPage(1) }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : users.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={<UserPlus size={22} />} title="No users found" description="Try adjusting your filters." className="py-12" /></td></tr>
                  : users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatarUrl} name={u.username} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{u.username}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{u.id?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={roleVariant[u.role] || 'default'} size="sm">{u.role}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[u.status] || 'default'} size="sm" dot>
                          {USER_STATUS_LABEL[u.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmt(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <UserActionMenu user={u} onStatusChange={handleStatusChange}
                          onRoleChange={handleRoleChange} onDelete={setDeleteTarget} />
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <DeleteModal user={deleteTarget} open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchUsers} />
    </div>
  )
}
