'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Building2,
  Globe,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react'

interface UserInfo {
  first_name?: string
  last_name?: string
  email?: string
  address?: string
  city?: string
  country?: string
}

interface DashboardData {
  users: UserInfo
}

export default function PersonalDetails() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setDashboardData(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  const userInfo = dashboardData?.users || user
  const fullName =
    userInfo?.first_name || userInfo?.last_name
      ? `${userInfo?.first_name || ''} ${userInfo?.last_name || ''}`.trim()
      : 'Not provided'

  const initials =
    userInfo?.first_name && userInfo?.last_name
      ? `${userInfo.first_name[0]}${userInfo.last_name[0]}`.toUpperCase()
      : userInfo?.first_name
      ? userInfo.first_name[0].toUpperCase()
      : 'U'

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
                Personal Details
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                Verified account profile and personal record
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Details List Card */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5 shadow-sm divide-y divide-slate-800/80">
          {/* Full Name */}
          <div className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Full Name</span>
            </div>
            <span className="text-xs font-bold text-white text-right">
              {loading ? '...' : fullName}
            </span>
          </div>

          {/* Email */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Email</span>
            </div>
            <span className="text-xs font-bold text-white text-right font-mono truncate max-w-[200px]">
              {loading ? '...' : userInfo?.email || 'Not provided'}
            </span>
          </div>

          {/* Address */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Address</span>
            </div>
            <span className="text-xs font-bold text-white text-right truncate max-w-[200px]">
              {loading ? '...' : userInfo?.address || 'Not provided'}
            </span>
          </div>

          {/* City */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">City</span>
            </div>
            <span className="text-xs font-bold text-white text-right">
              {loading ? '...' : userInfo?.city || 'Not provided'}
            </span>
          </div>

          {/* Country */}
          <div className="py-3.5 last:pb-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Country</span>
            </div>
            <span className="text-xs font-bold text-white text-right">
              {loading ? '...' : userInfo?.country || 'Not provided'}
            </span>
          </div>
        </div>

        {/* Security Footer Banner */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Protected Personal Data</p>
            <p className="text-[11px] text-slate-400">
              To update your legal address or verified name, please contact support verification.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}