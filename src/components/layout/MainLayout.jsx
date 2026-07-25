import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileSidebar from './MobileSidebar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <Navbar />
      <MobileSidebar />

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
