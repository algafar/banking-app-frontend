'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import API_BASE_URL from '@/lib/api'
import {
  LayoutDashboard,
  Users,
  Receipt,
  MessageSquare,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  Shield,
  Focus,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Track previous message lengths to detect new incoming messages globally
  const prevMessagesLengthRef = useRef<{ [roomId: number]: number }>({})

  // Navigation Items for ViewmTrust Admin Portal
  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Accounts & Freeze', href: '/admin/users', icon: Users },
    { name: 'Ledger & Disputes', href: '/admin/transactions', icon: Receipt },
    { name: 'Support Tickets & Messages', href: '/admin/support', icon: MessageSquare },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // Verify admin token against FastAPI backend
  const verifyAdminSession = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return null
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/support`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token')
        router.push('/login')
        return null
      }

      if (!res.ok) {
        return null
      }

      return token
    } catch (err) {
      localStorage.removeItem('token')
      router.push('/login')
      return null
    }
  }, [router])

  // Global background polling loop for chat rooms & custom toast alerts
  const pollSupportRooms = useCallback(async (isInitial = false) => {
    const validToken = await verifyAdminSession()
    if (!validToken) return

    try {
      const res = await fetch(`${API_BASE_URL}/admin/chat-rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      })

      if (!res.ok) return

      const data = await res.json()
      const rooms = data || []

      if (!isInitial) {
        rooms.forEach((room: any) => {
          const messages = room.chat_messages || []
          const prevLength = prevMessagesLengthRef.current[room.room_id] ?? messages.length

          // Trigger notification if message count increased
          if (messages.length > prevLength) {
            const latestMsg = messages[messages.length - 1]
            
            if (latestMsg && latestMsg.sender_type?.toUpperCase() === 'CUSTOMER') {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 text-white p-4`}>
                  <div className="flex-1">
                    <p className="text-xs font-mono text-amber-400">New Message • Room #{room.room_id}</p>
                    <p className="text-sm font-bold mt-0.5">{room.users?.full_name || `User #${room.user_id}`}</p>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">{latestMsg.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id)
                      router.push('/admin/support')
                    }}
                    className="ml-4 self-center px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ), { duration: 6000 })
            }
          }

          prevMessagesLengthRef.current[room.room_id] = messages.length
        })
      } else {
        rooms.forEach((room: any) => {
          prevMessagesLengthRef.current[room.room_id] = room.chat_messages?.length || 0
        })
      }
    } catch (err) {
      console.error('Global poll error:', err)
    }
  }, [verifyAdminSession, router])

  useEffect(() => {
    pollSupportRooms(true)

    // Run polling check every 5 seconds globally
    const interval = setInterval(() => {
      pollSupportRooms(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [pollSupportRooms])

  return (
    <div className="min-h-screen bg-[#070d18] text-white flex font-sans">
      {/* Toast Notification Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0b1320] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Navbar Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#09101d]">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/10 shrink-0">
                <Focus className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                  viewmtrust
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-semibold block mt-1">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              System Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-[#132238]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Admin Session Info */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#09101d]">
          <div className="bg-[#132238] rounded-xl p-3 flex items-center gap-3 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Super Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@viewmtrust.com</p>
            </div>
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0b1320] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-[#132238] rounded-lg border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ViewmTrust Navbar Brand (Mobile View) */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-[10px]">
                <Focus className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                viewmtrust
              </span>
              <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                ADMIN
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Core Engine: <strong className="text-emerald-400">Online</strong></span>
            </div>
          </div>

          {/* Quick Controls & Ledger Search */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ViewmTrust ledger..."
                className="bg-[#132238] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition w-60"
              />
            </div>

            <button className="w-9 h-9 rounded-xl bg-[#132238] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2" />
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}