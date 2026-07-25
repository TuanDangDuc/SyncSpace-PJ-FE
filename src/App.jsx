import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

// Layouts
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
import SessionTimeoutModal from '@/components/auth/SessionTimeoutModal'

// User pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const LocationsPage = lazy(() => import('@/pages/LocationsPage'))
const LocationDetailPage = lazy(() => import('@/pages/LocationDetailPage'))
const WorkspaceDetailPage = lazy(() => import('@/pages/WorkspaceDetailPage'))
const MyBookingsPage = lazy(() => import('@/pages/MyBookingsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminLocationsPage = lazy(() => import('@/pages/admin/AdminLocationsPage'))
const AdminWorkspacesPage = lazy(() => import('@/pages/admin/AdminWorkspacesPage'))
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage'))

// Guards
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <>
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-gray-50"><Spinner size="lg" /></div>}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        </Route>

        {/* Main user routes */}
        <Route element={<MainLayout />}>
          <Route path="/"                          element={<HomePage />} />
          <Route path="/locations"                 element={<LocationsPage />} />
          <Route path="/locations/:id"             element={<LocationDetailPage />} />
          <Route path="/workspaces/:id"            element={<WorkspaceDetailPage />} />
          <Route path="/my-bookings"               element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
          <Route path="/profile"                   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                             element={<AdminDashboardPage />} />
          <Route path="users"                      element={<AdminUsersPage />} />
          <Route path="locations"                  element={<AdminLocationsPage />} />
          <Route path="workspaces"                 element={<AdminWorkspacesPage />} />
          <Route path="bookings"                   element={<AdminBookingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    <SessionTimeoutModal />
    </>
  )
}
