import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

const navLinks = [
  { label: 'Home',        to: '/' },
  { label: 'Locations',   to: '/locations' },
  { label: 'My Bookings', to: '/my-bookings' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { toggleSidebar } = useUiStore()
  const navigate      = useNavigate()
  const { pathname }  = useLocation()
  const [dropOpen, setDropOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    setDropOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 h-14 transition-all duration-200',
        scrolled
          ? 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-gray-150 shadow-xs'
          : 'bg-[#FAF9F6] border-b border-gray-150',
      )}
    >
      <div className="page-container h-full flex items-center justify-between gap-4">

        {/* Logo — serif wordmark */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded bg-primary-500 flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-sm leading-none">S</span>
          </div>
          <span className="font-display font-semibold text-gray-900 text-[16px] tracking-tight">
            SyncSpace
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => {
            const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md',
                  isActive
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-primary-500 rounded-full" />
                )}
              </Link>
            )
          })}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={cn(
                'relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1.5',
                pathname.startsWith('/admin')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
              )}
            >
              <LayoutDashboard size={13} />
              Admin
              {pathname.startsWith('/admin') && (
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-primary-500 rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <button className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500" />
              </button>

              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.username}
                  </span>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-150 rounded-lg shadow-dropdown py-1 animate-slide-up z-50">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={14} className="text-gray-400" /> Profile
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={14} className="text-gray-400" /> Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                Sign in
              </Link>
              <Link to="/register"
                className="px-3.5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors">
                Get started
              </Link>
            </div>
          )}

          <button onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
