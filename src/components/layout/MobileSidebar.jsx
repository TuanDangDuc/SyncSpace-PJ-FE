import { Link, useLocation } from 'react-router-dom'
import { X, Home, MapPin, CalendarCheck, User, LayoutDashboard } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const links = [
  { label: 'Home',        to: '/',            icon: <Home size={16} strokeWidth={1.5} /> },
  { label: 'Locations',   to: '/locations',   icon: <MapPin size={16} strokeWidth={1.5} /> },
  { label: 'My Bookings', to: '/my-bookings', icon: <CalendarCheck size={16} strokeWidth={1.5} /> },
  { label: 'Profile',     to: '/profile',     icon: <User size={16} strokeWidth={1.5} /> },
]

export default function MobileSidebar() {
  const { sidebarOpen, closeSidebar } = useUiStore()
  const { user } = useAuthStore()
  const { pathname } = useLocation()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/20 backdrop-blur-[2px] md:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 z-50 border-r border-gray-150 shadow-dropdown',
        'flex flex-col transition-transform duration-250 md:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )} style={{ backgroundColor: '#FAF9F6' }}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-150">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm leading-none">S</span>
            </div>
            <span className="font-display font-semibold text-gray-900 text-[15px]">SyncSpace</span>
          </div>
          <button onClick={closeSidebar}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                pathname === link.to
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}>
              <span className={cn(pathname === link.to ? 'text-primary-500' : 'text-gray-400')}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}>
              <LayoutDashboard size={16} strokeWidth={1.5} className="text-gray-400" />
              Admin
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
