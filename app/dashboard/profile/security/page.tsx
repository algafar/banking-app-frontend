'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Smartphone,
  ShieldAlert,
} from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [twoFactor, setTwoFactor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/dashboard/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (response.ok) {
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        })
        setSuccess('Your password has been updated successfully.')
      } else {
        setError('Could not update password. Please check your current password.')
      }
    } catch (err) {
      console.error(err)
      setError('Could not update password. Network error.')
    } finally {
      setSaving(false)
    }
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
                Security & Password
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                Manage your credentials and authentication settings
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-800 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <KeyRound className="w-32 h-32 text-amber-400" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Account Security
            </span>
            <p className="text-xl font-bold tracking-tight text-white">
              Password & 2FA
            </p>
            <p className="text-xs text-slate-400">
              Keep your financial account safe with a strong password and multi-factor protection.
            </p>
          </div>
        </div>

        {/* Change Password Form */}
        <form
          onSubmit={handleUpdatePassword}
          className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Change Password
            </h2>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                required
                name="current_password"
                type={showCurrent ? 'text' : 'password'}
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                required
                name="new_password"
                type={showNew ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                required
                name="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>Use at least 8 characters with numbers or symbols.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        {/* Two-Factor Authentication Card */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Two-Factor Authentication</p>
                <p className="text-[11px] text-slate-400">
                  Require a verification code when signing in
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTwoFactor((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                twoFactor ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  twoFactor ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}