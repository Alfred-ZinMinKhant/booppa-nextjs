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

  // removeNotification è stabile grazie a useCallback
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((payload: NotificationPayload) => {
    const id = crypto.randomUUID()
    const notification: Notification = { id, timestamp: new Date(), ...payload }
    setNotifications(prev => [...prev, notification])
    // Auto-dismiss dopo 5 s — un singolo timeout, gestito qui
    setTimeout(() => removeNotification(id), 5000)
  }, [removeNotification])

  useEffect(() => {
    // ─────────────────────────────────────────────────────────────────────────
    // SOLUZIONE AL BUG COOKIE HttpOnly:
    // Il token è in un cookie HttpOnly e NON è leggibile da document.cookie.
    // Lo recuperiamo tramite una Route API dedicata che lo legge lato server
    // e lo restituisce solo per inizializzare il WebSocket.
    // ─────────────────────────────────────────────────────────────────────────
    let cancelled = false

    const initSocket = async () => {
      try {
        const res = await fetch('/api/auth/ws-token')
        if (!res.ok) return          // utente non autenticato: niente socket

        const { wsToken } = await res.json() as { wsToken: string }
        if (cancelled) return

        const socket = io(config.wsUrl, {
          path: '/socket.io',
          transports: ['websocket'],
          auth: { token: wsToken },   // ← modo raccomandato da socket.io
        })

        socket.on('connect', () => {
          console.log('[WS] connected')
        })

        // Evento emesso dal backend quando un'Enterprise apre il link di verifica
        socket.on('enterprise_visited', (data: { enterpriseName: string }) => {
          addNotification({
            type: 'info',
            message: `${data.enterpriseName} ha aperto il link di verifica`,
            enterpriseName: data.enterpriseName,
          })
        })

        // Evento generico di successo (es. verifica completata)
        socket.on('verify_completed', (data: { enterpriseName: string }) => {
          addNotification({
            type: 'success',
            message: `${data.enterpriseName} ha completato la verifica`,
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
  if (!ctx) throw new Error('useNotifications deve essere usato dentro NotificationProvider')
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
        aria-label="Chiudi notifica"
      >
        ✕
      </button>
    </div>
  )
}
