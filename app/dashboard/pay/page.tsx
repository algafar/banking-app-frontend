'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ReceiptText,
  Zap,
  Droplets,
  Wifi,
  Tv,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Clock,
  ChevronDown,
} from 'lucide-react'

const BILLER_OPTIONS: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  electricity: {
    label: 'Electricity / Power (PHED/IKEDC)',
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  water: {
    label: 'Municipal Water Board',
    icon: Droplets,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  internet: {
    label: 'Fiber Internet Subscription',
    icon: Wifi,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  cable: {
    label: 'Cable TV (DSTV/Netflix)',
    icon: Tv,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
}

export default function PayBillsPage() {
  const router = useRouter()

  const [biller, setBiller] = useState('electricity')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)
    }, 1200)
  }

  const handleReset = () => {
    setSuccess(false)
    setAmount('')
    setAccountNumber('')
  }

  const SelectedIcon = BILLER_OPTIONS[biller]?.icon || Zap

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
              <h1 className="text-base font-bold text-white leading-none">Pay Bills & Utilities</h1>
              <p className="text-[11px] text-slate-400 mt-1">Settle utility bills and subscriptions instantly</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-800 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ReceiptText className="w-32 h-32 text-amber-400" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Instant Settlement
            </span>
            <p className="text-xl font-bold tracking-tight text-white">Utility Payments</p>
            <p className="text-xs text-slate-400">
              Pay power, internet, water, and tv bills directly with automatic receipt generation.
            </p>
          </div>
        </div>

        {/* Form / Success View */}
        {success ? (
          <div className="bg-[#132238] border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">Payment Successful!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your payment of <span className="text-amber-400 font-bold">${parseFloat(amount).toFixed(2)}</span> to <span className="text-white font-semibold">{BILLER_OPTIONS[biller]?.label}</span> was completed.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Account / Meter:</span>
                <span className="text-white font-mono font-bold">{accountNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Processed</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Make Another Payment
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            {/* Custom Dropdown */}
            <div className="space-y-1 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Select Biller
              </label>

              <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-800 border border-slate-700 hover:border-amber-500 text-white text-xs px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-lg ${BILLER_OPTIONS[biller]?.color}`}>
                    <SelectedIcon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{BILLER_OPTIONS[biller]?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl divide-y divide-slate-700/50">
                  {Object.entries(BILLER_OPTIONS).map(([key, item]) => {
                    const Icon = item.icon
                    const isSelected = biller === key
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setBiller(key)
                          setIsOpen(false)
                        }}
                        className={`px-3.5 py-3 text-xs cursor-pointer flex items-center gap-2.5 transition-colors hover:bg-slate-700/50 ${
                          isSelected ? 'bg-slate-700/80 text-amber-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Account / Meter Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Complete Payment</span>
              )}
            </button>
          </form>
        )}

        {/* Benefits Grid */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Direct Biller Clearance</p>
              <p className="text-[11px] text-slate-400">Directly integrated with regional service provider portals.</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Instant Proof of Payment</p>
              <p className="text-[11px] text-slate-400">Electronic receipt available for instant download and history log.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}