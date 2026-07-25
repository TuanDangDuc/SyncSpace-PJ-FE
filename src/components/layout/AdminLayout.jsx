import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, MapPin, Building2,
  CalendarCheck, LogOut, ChevronRight, PanelLeft,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Dashboard',  to: '/admin',           icon: <LayoutDashboard size={16} strokeWidth={1.5} />, exact: true },
  { label: 'Users',      to: '/admin/users',      icon: <Users size={16} strokeWidth={1.5} /> },
  { label: 'Locations',  to: '/admin/locations',  icon: <MapPin size={16} strokeWidth={1.5} /> },
  { label: 'Workspaces', to: '/admin/workspaces', icon: <Building2 size={16} strokeWidth={1.5} /> },
  { label: 'Bookings',   to: '/admin/bookings',   icon: <CalendarCheck size={16} strokeWidth={1.5} /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-30 flex flex-col border-r border-gray-150',
        'transition-all duration-200',
        collapsed ? 'w-14' : 'w-56',
      )} style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <div className={cn(
          'flex items-center h-14 border-b border-gray-150 px-3 shrink-0 gap-2',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center shrink-0">
                <span className="text-white font-display font-bold text-xs leading-none">S</span>
              </div>
              <span className="font-display font-semibold text-gray-900 text-sm truncate">SyncSpace</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <PanelLeft size={15} />
          </button>
        </div>

        {/* Admin label */}
        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 px-2.5 py-1.5 rounded border border-gray-150" style={{ backgroundColor: '#F5F1EB' }}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Admin Panel</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-75 hover:text-gray-900',
                collapsed && 'justify-center px-2',
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn('shrink-0', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600')}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-150 p-2 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1 min-w-0">
              <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.username}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={async () => { await logout(); navigate('/login') }}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-danger-600',
              'hover:bg-danger-50 transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={cn('flex-1 min-h-screen transition-all duration-200', collapsed ? 'pl-14' : 'pl-56')}>
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
