import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-150" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded bg-primary-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm leading-none">S</span>
              </div>
              <span className="font-display font-semibold text-gray-900 text-[16px] tracking-tight">
                SyncSpace
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Real-time workspace allocation platform built for modern teams and coworking spaces.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 bg-white transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-gray-800 mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Locations',   to: '/locations' },
                { label: 'My Bookings', to: '/my-bookings' },
                { label: 'Profile',     to: '/profile' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-gray-800 mb-4">Built with</p>
            <ul className="space-y-2.5">
              {['Spring Boot 3.x', 'PostgreSQL + Redis', 'Apache Kafka', 'Kubernetes'].map((t) => (
                <li key={t} className="text-sm text-gray-500">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} SyncSpace. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full status-available" />
            <span className="text-xs text-success-600 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
