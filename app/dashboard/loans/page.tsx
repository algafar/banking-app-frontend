'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Landmark,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Percent,
  Calendar,
  X,
  Loader2,
} from 'lucide-react'

export default function LoansPage() {
  const router = useRouter()
  
  // State for Loan Application Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [term, setTerm] = useState('12')
  const [purpose, setPurpose] = useState('Personal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Mock Active Loans Data
  const [activeLoans, setActiveLoans] = useState([
    {
      id: 'LN-8842',
      type: 'Personal Loan',
      totalAmount: 10000,
      remainingAmount: 4250,
      monthlyPayment: 435.20,
      nextDueDate: 'Oct 15, 2026',
      interestRate: '5.4%',
      status: 'ACTIVE',
    },
  ])

  // Estimated Interest Rate Calculation
  const calculateEstimatedPayment = () => {
    const principal = parseFloat(amount) || 0
    const months = parseInt(term) || 12
    if (principal <= 0) return '0.00'
    const annualRate = 0.065 // 6.5% interest
    const monthlyRate = annualRate / 12
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    return isNaN(payment) ? '0.00' : payment.toFixed(2)
  }

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMessage('Loan application submitted successfully for review!')
      
      setTimeout(() => {
        setIsApplyOpen(false)
        setSuccessMessage('')
        setAmount('')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Header */}
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
              <h1 className="text-base font-bold text-white leading-none">Loans & Credit</h1>
              <p className="text-[11px] text-slate-400 mt-1">Manage borrowings and instant credit</p>
            </div>
          </div>

          <button
            onClick={() => setIsApplyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">

        {/* Credit Limit Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-800 to-slate-800 border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="w-32 h-32 text-blue-400" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Pre-Approved Limit
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold tracking-tight text-white">$25,000.00</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant disbursement available at low fixed rates.
              </p>
            </div>

            <button
              onClick={() => setIsApplyOpen(true)}
              className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Request Instant Advance</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Loans Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Loans
          </h3>

          {activeLoans.length === 0 ? (
            <div className="bg-[#132238] border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <Landmark className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No Active Loans</p>
              <p className="text-[11px] text-slate-400">
                You currently have no active personal or business loans.
              </p>
            </div>
          ) : (
            activeLoans.map((loan) => {
              const progressPercentage = Math.round(
                ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100
              )

              return (
                <div
                  key={loan.id}
                  className="bg-[#132238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{loan.type}</p>
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                          {loan.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fixed APR: <span className="text-emerald-400 font-semibold">{loan.interestRate}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {loan.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Repayment Progress</span>
                      <span className="font-bold text-white">{progressPercentage}% Paid</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span>Paid: ${(loan.totalAmount - loan.remainingAmount).toLocaleString()}</span>
                      <span>Remaining: ${loan.remainingAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Details Box */}
                  <div className="bg-slate-900/60 rounded-xl p-3 grid grid-cols-2 gap-3 border border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Payment</p>
                      <p className="text-sm font-bold text-white mt-0.5">${loan.monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Next Due Date</p>
                      <p className="text-sm font-bold text-amber-400 mt-0.5">{loan.nextDueDate}</p>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white rounded-xl transition cursor-pointer">
                    Make Repayment
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Features & Eligibility */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Borrowing Benefits
          </h3>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Competitive Fixed Rates</p>
                <p className="text-[11px] text-slate-400">Starting from 5.4% APR with transparent terms.</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">No Prepayment Penalties</p>
                <p className="text-[11px] text-slate-400">Pay off your balance early anytime without fees.</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Flexible Repayment Terms</p>
                <p className="text-[11px] text-slate-400">Choose payback schedules from 6 to 60 months.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Application Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>Apply for a New Loan</span>
              </h3>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-white">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Loan Amount ($)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="50000"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Term (Months)
                    </label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                      <option value="60">60 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Purpose
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Debt Consolidation">Consolidation</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Estimate Preview */}
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Monthly</p>
                    <p className="text-xs text-slate-300">Base APR ~6.5%</p>
                  </div>
                  <p className="text-base font-bold text-blue-400">${calculateEstimatedPayment()}/mo</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Application...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}