'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface UserInfo {
  first_name?: string
  last_name?: string
  email?: string
  country?: string
  city?: string
  address?: string
  profile_picture?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchUserProfile = async (tokenStr: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: {
            Authorization: `Bearer ${tokenStr}`,
          },
        })

        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        setUser(data.users || data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile(token)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
      : 'Account Holder'

  const initials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.first_name
      ? user.first_name[0].toUpperCase()
      : 'U'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex items-center justify-center">
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading user profile...</p>
        </div>
      </div>
    )
  }

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
              <h1 className="text-base font-bold text-white leading-none">
                Account Settings
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                Manage your preferences and security
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* User Card Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-amber-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-extrabold text-lg flex items-center justify-center shadow-lg shrink-0 border border-amber-400/30">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white truncate">
                {fullName}
              </h2>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
              {user?.email || 'No email attached'}
            </p>
          </div>
        </div>

        {/* Menu Options Group */}
        <div className="space-y-3">
          {/* Personal Details Link */}
          <button
            onClick={() => router.push('/dashboard/profile/personal_details')}
            className="w-full bg-[#132238] hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  Personal Details
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Update your personal information & address
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Security Link */}
          <button
            onClick={() => router.push('/dashboard/profile/security')}
            className="w-full bg-[#132238] hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Security & Password
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Password, PIN & two-factor authentication
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Notifications Link */}
          <button
            onClick={() => router.push('/dashboard/profile/notifications')}
            className="w-full bg-[#132238] hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all duration-200 flex items-center justify-between text-left cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                  Notifications
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Manage alert preferences and activity logs
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Logout Action */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 p-4 rounded-2xl transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Sign Out of Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500/50 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  )
}