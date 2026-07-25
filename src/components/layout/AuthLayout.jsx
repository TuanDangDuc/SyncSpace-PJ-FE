import { Outlet, Link } from 'react-router-dom'
import { Zap, Shield, Clock } from 'lucide-react'

const features = [
  { icon: <Zap size={14} />, text: 'Real-time workspace availability via SSE' },
  { icon: <Shield size={14} />, text: 'Conflict-free bookings with Kafka + locking' },
  { icon: <Clock size={14} />, text: 'Redis cache · sub-5ms response time' },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Left panel — deep espresso */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ backgroundColor: '#1C1410' }}>

        {/* Subtle linen texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Warm gradient from bottom */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Top — logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-base leading-none">S</span>
            </div>
            <span className="font-display font-semibold text-white text-lg tracking-tight">SyncSpace</span>
          </Link>
        </div>

        {/* Middle — headline */}
        <div className="relative z-10">
          <p className="text-primary-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Workspace Platform
          </p>
          <h1 className="font-display font-semibold text-white text-[2.2rem] leading-tight mb-4">
            The smarter way<br />
            <em className="not-italic text-primary-300">to book</em> your<br />
            workspace.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            Instant availability, zero double-bookings, and a workspace that fits exactly how you work.
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-7 h-7 rounded border border-white/10 bg-white/5 flex items-center justify-center shrink-0 text-primary-400">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom — copyright */}
        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} SyncSpace. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm leading-none">S</span>
            </div>
            <span className="font-display font-semibold text-gray-900 text-[16px]">SyncSpace</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
