'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  FileCheck2,
  Upload,
} from 'lucide-react'

export default function CheckDepositPage() {
  const router = useRouter()

  const [amount, setAmount] = useState('')
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frontImage || !backImage) {
      setError('Please upload both the front and endorsed back photos of the check.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('front_image', frontImage)
    formData.append('back_image', backImage)

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/deposit-check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to process check deposit.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setFrontImage(null)
    setBackImage(null)
    setAmount('')
    setError('')
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
              <h1 className="text-base font-bold text-white leading-none">Mobile Check Deposit</h1>
              <p className="text-[11px] text-slate-400 mt-1">Scan checks for quick digital clearance</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-800 to-slate-800 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileCheck2 className="w-32 h-32 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Express Processing
            </span>
            <p className="text-xl font-bold tracking-tight text-white">Deposit Checks Anywhere</p>
            <p className="text-xs text-slate-400">
              Upload clear photos of the front and endorsed back of your paper check for rapid processing.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form / Success View */}
        {submitted ? (
          <div className="bg-[#132238] border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">Check Submitted Successfully</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your check deposit is under verification and will be credited within 1-2 business days.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Declared Amount:</span>
                <span className="text-white font-mono font-bold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Verification Status:</span>
                <span className="text-amber-400 font-bold">Pending Review</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Deposit Another Check
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            {/* Dual Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front Photo */}
              <label className="border-2 border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[120px]">
                <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mb-2 transition" />
                <span className="text-xs font-bold text-slate-200">Front of Check</span>
                <span className="text-[11px] text-amber-400 mt-1 truncate max-w-[180px]">
                  {frontImage ? frontImage.name : 'Click to capture/upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                />
              </label>

              {/* Back Photo */}
              <label className="border-2 border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[120px]">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mb-2 transition" />
                <span className="text-xs font-bold text-slate-200">Back (Endorsed)</span>
                <span className="text-[11px] text-amber-400 mt-1 truncate max-w-[180px]">
                  {backImage ? backImage.name : 'Click to capture/upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Check Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Deposit...</span>
                </>
              ) : (
                <span>Submit Check Deposit</span>
              )}
            </button>
          </form>
        )}

        {/* Benefits Grid */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Bank-Grade OCR Verification</p>
              <p className="text-[11px] text-slate-400">Automated check text recognition for fraud prevention.</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">1–2 Day Settlement</p>
              <p className="text-[11px] text-slate-400">Funds are verified and made available straight to your balance.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}