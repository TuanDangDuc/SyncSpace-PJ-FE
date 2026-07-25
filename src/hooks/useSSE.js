import { useEffect, useRef } from 'react'
import { API_BASE_URL } from '@/utils/constants'
import { useAuthStore } from '@/store/authStore'

/**
 * Subscribes to a Server-Sent Events endpoint.
 *
 * @param {string|null} path   - relative path, e.g. '/notifications/workspaces/stream?locationId=xxx'
 * @param {function}    onMessage - callback(MessageEvent)
 * @param {boolean}     enabled   - toggle subscription (default true)
 */
export function useSSE(path, onMessage, enabled = true) {
  const onMessageRef = useRef(onMessage)
  const esRef        = useRef(null)

  // keep ref fresh without re-subscribing
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  useEffect(() => {
    if (!enabled || !path) return

    const token = useAuthStore.getState().accessToken
    const url   = `${API_BASE_URL}${path}${path.includes('?') ? '&' : '?'}token=${token ?? ''}`

    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (event) => {
      try { onMessageRef.current?.(event) } catch { /* swallow handler errors */ }
    }

    es.onerror = () => {
      // EventSource auto-reconnects — we just close & let it retry
      if (es.readyState === EventSource.CLOSED) {
        esRef.current = null
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [path, enabled])
}
