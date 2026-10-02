'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Upload, Loader2, Sparkles } from 'lucide-react'
import API_BASE_URL from '@/lib/api'

interface UserInfo {
  first_name: string
  last_name: string
  email?: string
  country?: string
  city?: string
  address?: string
  profile_picture?: string
}

interface DashboardData {
  users: UserInfo
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.users || data)
          setDashboardData(data)
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(
        `${API_BASE_URL}/profile/upload-picture/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUser((prev) =>
          prev ? { ...prev, profile_picture: data.profile_picture } : null
        )
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                users: { ...prev.users, profile_picture: data.profile_picture },
              }
            : null
        )
      } else {
        console.error('Failed to upload image')
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err)
    } finally {
      setUploading(false)
    }
  }

  const profilePic = dashboardData?.users?.profile_picture || user?.profile_picture
  const fullName =
    dashboardData?.users?.first_name || dashboardData?.users?.last_name
      ? `${dashboardData.users.first_name || ''} ${
          dashboardData.users.last_name || ''
        }`.trim()
      : 'Account User'

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              Profile & Account
            </h1>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Container - Offsets header height with pt-20 */}
      <main className="max-w-xl mx-auto px-4 pt-20 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative group mb-3">
            {/* Avatar Frame */}
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center shadow-lg relative">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}

              {uploading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Upload Button overlay badge */}
            <label className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center border border-slate-900">
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <h2 className="text-base font-bold text-white mt-1">{fullName}</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {dashboardData?.users?.email || 'Account Holder'}
          </p>
        </div>

        {/* Dynamic Page Content */}
        <div>{children}</div>
      </main>
    </div>
  )
}