'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  Users,
  ShieldAlert,
  MessageSquare,
  Receipt,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  Clock,
  Activity,
  RefreshCw,
  Send,
  Focus,
} from 'lucide-react'

interface Stats {
  totalUsers: number
  frozenUsers: number
  openTickets: number
  totalMessages: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    frozenUsers: 0,
    openTickets: 0,
    totalMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  const verifyAdminSession = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('No authentication token found. Redirecting to login.')
      router.push('/login')
      return null
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        console.warn('Session expired or unauthorized. Redirecting to login.')
        localStorage.removeItem('token')
        router.push('/login')
        return null
      }

      if (!res.ok) {
        throw new Error('Failed to verify admin credentials.')
      }

      return token
    } catch (err) {
      console.error('Session verification error:', err)
      localStorage.removeItem('token')
      router.push('/login')
      return null
    }
  }, [router])

  // Fetch persistent statistics matching actual backend database models
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)

    // Verify session token before loading data
    const validToken = await verifyAdminSession()
    if (!validToken) return

  }, [verifyAdminSession])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#132238] border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center">
              <Focus className="w-3 h-3 text-slate-950 font-bold" />
            </div>
            <span className="font-extrabold text-lg text-white">viewmtrust</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
              SYSTEM COMMAND
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Core Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage user accounts, send saved messages, and monitor transaction ledgers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-[#0b1320] border border-slate-700 hover:text-amber-500 text-slate-300 rounded-xl text-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/users"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-amber-500/10"
          >
            <Send className="w-4 h-4" />
            <span>Send User Message</span>
          </Link>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active database record count</span>
          </div>
        </div>

        {/* Frozen Accounts */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Frozen Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : stats.frozenUsers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-red-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Suspended for review</span>
          </div>
        </div>

        {/* Total Saved Messages */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Messages Dispatched</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : stats.totalMessages.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved permanently in database</span>
          </div>
        </div>

        {/* Open Support Chatrooms */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Open Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : stats.openTickets.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending customer support desk</span>
          </div>
        </div>
      </div>

      {/* Operational Hub Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-[#132238] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white group-hover:text-amber-500 transition">
            User Accounts & Freeze Desk
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Search users, freeze/unfreeze accounts, and send direct messages to user dashboards.
          </p>
        </Link>

        <Link
          href="/admin/transactions"
          className="bg-[#132238] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Receipt className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white group-hover:text-amber-500 transition">
            Ledger & Complaint Audit
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Search transaction IDs, audit double-entry balances, and resolve transfer disputes.
          </p>
        </Link>

        <Link
          href="/admin/support"
          className="bg-[#132238] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white group-hover:text-amber-500 transition">
            Support Queue & Live Chat
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Reply to submitted customer support tickets and handle live chat queries.
          </p>
        </Link>
      </div>

      {/* Audit Stream */}
      <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">ViewmTrust System Activity Stream</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Live Operation Logs</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <p className="font-bold text-white">Persistent Database Connected</p>
                <p className="text-[11px] text-slate-400">
                  Messages configured to save permanently in Supabase
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">Just now</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div>
                <p className="font-bold text-white">Admin Security Guard Enabled</p>
                <p className="text-[11px] text-slate-400">
                  Role-based layout boundaries active for /admin
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">10 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}