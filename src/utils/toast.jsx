/**
 * Custom toast wrapper with progress bar countdown.
 * Usage: import { showToast } from '@/utils/toast'
 *        showToast.success('message')
 *        showToast.error('message')
 */
import toast from 'react-hot-toast'

const DURATION = 4000

const progressBarStyle = (color) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '2.5px',
  width: '100%',
  background: color,
  transformOrigin: 'left',
  borderRadius: '0 0 10px 10px',
  animation: `shrink ${DURATION}ms linear forwards`,
})

// Inject keyframes once
if (typeof document !== 'undefined') {
  const styleId = '__toast_progress_style__'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes shrink {
        from { transform: scaleX(1); }
        to   { transform: scaleX(0); }
      }
    `
    document.head.appendChild(style)
  }
}

const ToastContent = ({ message, color }) => (
  <div style={{ position: 'relative', paddingBottom: '6px', minWidth: '180px' }}>
    <span>{message}</span>
    <div style={progressBarStyle(color)} />
  </div>
)

export const showToast = {
  success: (message) =>
    toast.custom(
      (t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#fff',
            color: '#171717',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            opacity: t.visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <ToastContent message={message} color="#22c55e" />
        </div>
      ),
      { duration: DURATION },
    ),

  error: (message) =>
    toast.custom(
      (t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#fff',
            color: '#171717',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #fee2e2',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            opacity: t.visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <ToastContent message={message} color="#f43f5e" />
        </div>
      ),
      { duration: DURATION },
    ),
}
