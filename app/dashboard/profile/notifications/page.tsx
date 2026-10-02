'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  Bell,
  ArrowLeftRight,
  Receipt,
  ShieldAlert,
  CheckCheck,
  AlertCircle,
  Loader2,
  Inbox,
} from 'lucide-react'

interface AppNotification {
  id: number
  title: string
  message: string
  type: 'transfer' | 'transaction' | 'security'
  read: boolean
  created_at: string
}

function formatWhen(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Icon routing helper by notification type
const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'transfer':
      return {
        icon: ArrowLeftRight,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      }
    case 'transaction':
      return {
        icon: Receipt,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      }
    case 'security':
      return {
        icon: ShieldAlert,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      }
    default:
      return {
        icon: Bell,
        color: 'text-slate-400 bg-slate-800 border-slate-700',
      }
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          console.error('Unauthorized! Check if token is valid or expired.')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (response.status === 404) {
          setItems([])
          setLoading(false)
          return
        }

        if (!response.ok) {
          setError('Could not load notifications')
          return
        }

        const data = await response.json()
        if (data.notification) {
          setItems([data.notification])
        } else {
          setItems(Array.isArray(data) ? data : data.items || [])
        }
      } catch (err) {
        console.error(err)
        setError('Could not load notifications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const unreadCount = items.filter((item) => !item.read).length

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Notifications</h1>
              <p className="text-[11px] text-slate-400 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Activity updates and alerts'}
              </p>
            </div>
          </div>

          <div className="relative w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Fetching notifications...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-white">No Notifications Yet</p>
            <p className="text-[11px] text-slate-400">
              When account activity occurs, updates will show up here.
            </p>
          </div>
        )}

        {/* Notification List */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => {
              const { icon: Icon, color } = getNotificationIcon(item.type)

              return (
                <div
                  key={item.id}
                  className={`bg-[#132238] border rounded-2xl p-4 transition-all relative overflow-hidden shadow-sm ${
                    item.read
                      ? 'border-slate-800 opacity-80'
                      : 'border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-[#132238] to-[#132238]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon Column */}
                    <div className={`p-2.5 rounded-xl shrink-0 border ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        {!item.read && (
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                        <span>{formatWhen(item.created_at)}</span>
                        {item.read && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}