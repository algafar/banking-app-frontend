'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  Users,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Mail
} from 'lucide-react'

interface UserRecord {
  user_id: number
  email: string
  status?: string
}

export default function AdminUsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load users list. Ensure you have admin permissions.')
      }

      const data = await response.json()
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFreeze = async (userId: number, currentStatus?: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Determine target action based on current state
    const normalizedStatus = currentStatus ? currentStatus.trim().toUpperCase() : 'ACTIVE'
    const isCurrentlyFrozen = normalizedStatus === 'FROZEN' || normalizedStatus === 'RESTRICTED'
    const newStatus = isCurrentlyFrozen ? 'ACTIVE' : 'FROZEN'
    
    const endpoint = isCurrentlyFrozen
      ? `${API_BASE_URL}/admin/users/${userId}/unfreeze` 
      : `${API_BASE_URL}/admin/users/${userId}/freeze`

    // 1. Instantly update UI state so button and badge switch immediately
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.user_id === userId ? { ...u, status: newStatus } : u
      )
    )

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to update account status.`)
      }

      setActionMessage(
        `User ID ${userId} has been successfully ${newStatus === 'FROZEN' ? 'frozen' : 'unfrozen'}.`
      )

      setTimeout(() => setActionMessage(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
      fetchUsers() // Revert back if network request fails
    }
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(u.user_id).includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-[#0b1320] text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="w-10 h-10 rounded-xl bg-[#132238] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                User Accounts & Freeze Desk
              </h1>
              <p className="text-xs text-slate-400">
                Manage user permissions, monitor statuses, and restrict accounts
              </p>
            </div>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionMessage && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or user ID..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* User Table Card */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Registered Accounts ({filteredUsers.length})</span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p>Loading users database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No user accounts found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-[#0b1320]/40">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredUsers.map((user) => {
                    const status = user.status ? user.status.trim().toUpperCase() : 'ACTIVE'
                    const isFrozen = status === 'FROZEN' || status === 'RESTRICTED'

                    return (
                      <tr key={user.user_id} className="hover:bg-[#0b1320]/30 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          #{user.user_id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-200 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {user.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isFrozen
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isFrozen ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleFreeze(user.user_id, user.status)}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 ml-auto transition cursor-pointer ${
                              isFrozen
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                            }`}
                          >
                            {isFrozen ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Unfreeze</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Freeze Account</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}