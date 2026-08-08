'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '@/lib/config'
import type { Notification, NotificationPayload } from '@/types'

// ─── Context ─────────────────────────────────────────────────────────────────

interface NotificationContextType {
  notifications: Notification[]
  addNotification:    (payload: NotificationPayload) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// ─── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const socketRef = useRef<Socket | null>(null)

  // removeNotification is stable thanks to useCallback
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((payload: NotificationPayload) => {
    const id = crypto.randomUUID()
    const notification: Notification = { id, timestamp: new Date(), ...payload }
    setNotifications(prev => [...prev, notification])
    // Auto-dismiss after 5s — a single timeout, owned here
    setTimeout(() => removeNotification(id), 5000)
  }, [removeNotification])

  useEffect(() => {
    // ─────────────────────────────────────────────────────────────────────────
    // HttpOnly cookie constraint:
    // The session token lives in an HttpOnly cookie and is NOT readable from
    // document.cookie. A dedicated API route reads it server-side and exchanges
    // it for a short-lived, WS-scoped handshake token used only to open the
    // socket. The session token itself never reaches the browser.
    // ─────────────────────────────────────────────────────────────────────────
    let cancelled = false

    const initSocket = async () => {
      try {
        const res = await fetch('/api/ws-token')
        if (!res.ok) return          // not authenticated: no socket

        const { wsToken } = await res.json() as { wsToken: string }
        if (cancelled) return

        const socket = io(config.wsUrl, {
          path: '/socket.io',
          transports: ['websocket'],
          auth: { token: wsToken },   // ← the socket.io-recommended mechanism
        })

        socket.on('connect', () => {
          console.log('[WS] connected')
        })

        // Emitted by the backend when an Enterprise opens the verification link
        socket.on('enterprise_visited', (data: { enterpriseName: string }) => {
          addNotification({
            type: 'info',
            message: `${data.enterpriseName} opened the verification link`,
            enterpriseName: data.enterpriseName,
          })
        })

        // Generic success event (e.g. verification completed)
        socket.on('verify_completed', (data: { enterpriseName: string }) => {
          addNotification({
            type: 'success',
            message: `${data.enterpriseName} completed verification`,
            enterpriseName: data.enterpriseName,
          })
        })

        socket.on('disconnect', (reason) => {
          console.log('[WS] disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
          console.warn('[WS] connection error:', err.message)
        })

        socketRef.current = socket
      } catch (err) {
        console.warn('[WS] init failed:', err)
      }
    }

    initSocket()

    return () => {
      cancelled = true
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationOverlay />
    </NotificationContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}

// ─── Overlay (Toast list) ─────────────────────────────────────────────────────

function NotificationOverlay() {
  const { notifications } = useNotifications()
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} />
      ))}
    </div>
  )
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

function NotificationToast({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotifications()

  const bg: Record<Notification['type'], string> = {
    info:    'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error:   'bg-red-600',
  }

  return (
    <div
      className={`
        ${bg[notification.type]}
        text-white px-4 py-3 rounded-lg shadow-lg max-w-sm
        flex items-start gap-3 pointer-events-auto
        animate-in slide-in-from-right duration-300
      `}
    >
      <p className="flex-1 text-sm">{notification.message}</p>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 text-white/80 hover:text-white"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
