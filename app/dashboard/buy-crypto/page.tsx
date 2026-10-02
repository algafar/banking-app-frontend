'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Wallet,
} from 'lucide-react'

// Mock current rates against USD
const CRYPTO_RATES: Record<string, { name: string; symbol: string; price: number }> = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', price: 65000 },
  ETH: { name: 'Ethereum', symbol: 'ETH', price: 3500 },
  SOL: { name: 'Solana', symbol: 'SOL', price: 145 },
  USDT: { name: 'Tether', symbol: 'USDT', price: 1.0 },
}

export default function BuyCryptoPage() {
  const router = useRouter()

  const [crypto, setCrypto] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Calculate estimated crypto output
  const calculateCryptoReceived = () => {
    const usdVal = parseFloat(amount) || 0
    if (usdVal <= 0) return '0.00'
    const rate = CRYPTO_RATES[crypto]?.price || 1
    const output = usdVal / rate
    return output < 0.0001 ? output.toFixed(8) : output.toFixed(4)
  }

  const handleSubmit = (e: React.FormEvent) => {
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
              <h1 className="text-base font-bold text-white leading-none">Buy Digital Assets</h1>
              <p className="text-[11px] text-slate-400 mt-1">Instant execution from your account balance</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-800 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Coins className="w-32 h-32 text-amber-400" />
          </div>

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Instant Settlement
            </span>
            <p className="text-xl font-bold tracking-tight text-white">Crypto Exchange</p>
            <p className="text-xs text-slate-400">
              Purchase Bitcoin, Ethereum, and major assets with zero hidden fees and cold wallet security.
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
              <h2 className="text-base font-bold text-white">Purchase Successful!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your purchase of <span className="text-amber-400 font-bold">{calculateCryptoReceived()} {crypto}</span> has been processed and added to your secure wallet.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="text-white font-mono font-bold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Asset Received:</span>
                <span className="text-emerald-400 font-mono font-bold">~{calculateCryptoReceived()} {crypto}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Buy More Assets
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Select Asset
              </label>
              <select
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                USD Amount to Spend ($)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Estimated Output Preview Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">You Receive Approx.</p>
                <p className="text-xs text-slate-400">1 {crypto} ≈ ${CRYPTO_RATES[crypto]?.price.toLocaleString()}</p>
              </div>
              <p className="text-sm font-bold text-amber-400 font-mono">
                {calculateCryptoReceived()} {crypto}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Swap...</span>
                </>
              ) : (
                <span>Buy {CRYPTO_RATES[crypto]?.name}</span>
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
              <p className="text-xs font-bold text-white">Cold Storage Protection</p>
              <p className="text-[11px] text-slate-400">Your digital assets are safeguarded by institutional custody.</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Real-Time Market Rates</p>
              <p className="text-[11px] text-slate-400">Guaranteed instant execution with standard market spread.</p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Direct Account Funding</p>
              <p className="text-[11px] text-slate-400">No external gateway needed—deducted straight from balance.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}