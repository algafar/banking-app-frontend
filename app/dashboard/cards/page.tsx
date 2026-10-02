'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Plus,
  Wifi,
  Sparkles,
  Sliders,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react'

export default function CardsPage() {
  const router = useRouter()

  // Dynamic state for card controls
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [onlinePayments, setOnlinePayments] = useState(true)
  const [dailyLimit, setDailyLimit] = useState(5000)

  // Interactive Modal States
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)
  const [newCardType, setNewCardType] = useState('virtual')
  const [limitInput, setLimitInput] = useState('5000')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Trigger temporary success notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle New Card Request
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault()
    setIsNewCardModalOpen(false)
    triggerToast(`New ${newCardType} card requested successfully!`)
  }

  // Handle Spending Limit Update
  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericLimit = Number(limitInput)
    if (!isNaN(numericLimit) && numericLimit > 0) {
      setDailyLimit(numericLimit)
      setIsLimitModalOpen(false)
      triggerToast('Daily spending limit updated!')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-none">
                Cards & Accounts
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">Manage physical & virtual cards</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Card</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Static / Dummy Card Preview */}
        <div className="relative group">
          <div
            className={`w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              isFrozen
                ? 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700 opacity-80'
                : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 border border-blue-400/30'
            }`}
          >
            {/* Glossy Overlay Pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            {/* Card Top Row */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                  Platinum Debit
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isFrozen && (
                  <span className="text-[10px] font-bold bg-rose-500/80 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Frozen
                  </span>
                )}
                <Wifi className="w-5 h-5 text-white/80 rotate-90" />
              </div>
            </div>

            {/* Chip & Number */}
            <div className="space-y-4 z-10 my-auto">
              <div className="w-11 h-8 rounded-md bg-amber-400/80 border border-amber-300/40 flex items-center justify-center">
                <div className="w-8 h-5 border border-amber-600/40 rounded-sm" />
              </div>

              <div>
                <p className="text-xs text-white/70 font-mono">CARD NUMBER</p>
                <p className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white mt-0.5">
                  {showCardDetails ? '4532 8910 2381 6817' : '•••• •••• •••• 6817'}
                </p>
              </div>
            </div>

            {/* Card Bottom Row */}
            <div className="flex items-end justify-between z-10">
              <div>
                <p className="text-[9px] font-semibold text-white/70 uppercase">Card Holder</p>
                <p className="text-xs font-bold text-white tracking-wider uppercase">
                  ACCOUNT HOLDER
                </p>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[9px] font-semibold text-white/70 uppercase">Expires</p>
                  <p className="text-xs font-bold text-white font-mono">08/29</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-white/70 uppercase">CVV</p>
                  <p className="text-xs font-bold text-white font-mono">
                    {showCardDetails ? '492' : '•••'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility & Details Toggle */}
        <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Show Full Card Info</p>
              <p className="text-[11px] text-slate-400">Reveal card number, expiry, and CVV</p>
            </div>
          </div>

          <button
            onClick={() => setShowCardDetails(!showCardDetails)}
            className="p-2.5 rounded-xl bg-slate-700 border border-slate-600 text-slate-200 hover:text-white transition cursor-pointer"
          >
            {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Card Controls */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Card Controls
          </h3>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            {/* Freeze Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isFrozen ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isFrozen ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Freeze Card</p>
                  <p className="text-[11px] text-slate-400">Temporarily disable all transactions</p>
                </div>
              </div>

              <button
                onClick={() => setIsFrozen(!isFrozen)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  isFrozen ? 'bg-rose-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    isFrozen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Online Transactions Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Online Shopping</p>
                  <p className="text-[11px] text-slate-400">Allow web and app transactions</p>
                </div>
              </div>

              <button
                onClick={() => setOnlinePayments(!onlinePayments)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  onlinePayments ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    onlinePayments ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Set Spending Limits Toggle */}
            <button
              onClick={() => {
                setLimitInput(String(dailyLimit))
                setIsLimitModalOpen(true)
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Spending Limits</p>
                  <p className="text-[11px] text-slate-400">
                    Daily limit: ${dailyLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

      </main>

      {/* New Card Modal */}
      {isNewCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCard} className="bg-[#132238] border border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Request New Card</h3>
              <button type="button" onClick={() => setIsNewCardModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Card Type</label>
              <select
                value={newCardType}
                onChange={(e) => setNewCardType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Virtual Platinum">Virtual Platinum (Instant)</option>
                <option value="Physical Debit">Physical Platinum Debit</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewCardModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Spending Limit Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveLimit} className="bg-[#132238] border border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Set Daily Spending Limit</h3>
              <button type="button" onClick={() => setIsLimitModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Maximum Daily Limit ($)</label>
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                placeholder="5000"
                min="100"
                required
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsLimitModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 transition cursor-pointer"
              >
                Save Limit
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}