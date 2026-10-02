'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  Eye,
  EyeOff,
  Home,
  ArrowLeftRight,
  CreditCard,
  Settings,
  Gift,
  ReceiptText,
  Coins,
  Loader2,
  AlertCircle,
  MessageSquare,
  Building2,
  Zap,
  Landmark,
  Check,
  X,
  Download,
  Printer,
  Target,
} from 'lucide-react'

interface Account {
  account_type?: string
  account_number?: string
  balance?: string | number
}

interface UserInfo {
  first_name?: string
  last_name?: string
  profile_picture?: string
}

interface DashboardData {
  users?: UserInfo
  account?: Account[]
}

interface Transaction {
  transaction_id: number
  reference_id?: string
  from_a?: string
  type?: string
  beneficiary_account?: string
  amount: number
  beneficiary_name?: string
  bank_name?: string
  swift_code?: string
  routing_number?: string
  remark?: string
  bank_address?: string
  date?: string
  status?: 'COMPLETED' | 'PENDING' | 'FAILED'
  fee?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)

  // Dynamic Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isTxLoading, setIsTxLoading] = useState(true)
  const [txError, setTxError] = useState<string | null>(null)

  // Receipt Modal State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Active Bottom Nav Tab
  const [activeTab, setActiveTab] = useState<'home' | 'loans' | 'cards' | 'settings'>('home')

  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        // 5-second safeguard timeout controller for dashboard session
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }).catch(() => null)

        clearTimeout(timeoutId)

        if (!response || response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (response.ok) {
          const data = await response.json()
          if (isMounted) setDashboardData(data)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        if (isMounted) {
          // Fallback data structure so UI renders even if endpoint lags
          setDashboardData({
            users: { first_name: 'Valued', last_name: 'Client' },
            account: [{ account_type: 'checking', account_number: '••••0000', balance: 0 }]
          })
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    const loadTransactions = async () => {
      try {
        setIsTxLoading(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${API_BASE_URL}/dashboard/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }).catch(() => null)

        clearTimeout(timeoutId)

        if (res && res.ok) {
          const txData = await res.json()
          if (isMounted) setTransactions(Array.isArray(txData) ? txData : [])
        } else {
          if (isMounted) setTxError('Could not load transactions')
        }
      } catch (err) {
        console.error('Transactions fetch error:', err)
        if (isMounted) setTxError('Could not load transactions')
      } finally {
        if (isMounted) setIsTxLoading(false)
      }
    }

    loadData()
    loadTransactions()

    return () => {
      isMounted = false
    }
  }, [router])

  // Compute dynamic monthly credit and debit totals
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyCredit = transactions
    .filter((tx) => {
      if (tx.status === 'FAILED') return false
      const txDate = tx.date ? new Date(tx.date) : null
      const isCurrentMonth =
        txDate && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
      const type = (tx.type || '').toLowerCase()
      const isCreditType = type === 'credit' || type === 'deposit'
      return isCurrentMonth && isCreditType
    })
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

  const monthlyDebit = transactions
    .filter((tx) => {
      if (tx.status === 'FAILED') return false
      const txDate = tx.date ? new Date(tx.date) : null
      const isCurrentMonth =
        txDate && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
      const type = (tx.type || '').toLowerCase()
      const isCreditType = type === 'credit' || type === 'deposit'
      return isCurrentMonth && !isCreditType
    })
    .reduce((sum, tx) => sum + Number(tx.amount || 0) + Number(tx.fee || 0), 0)

  // Calculations for Receipt Modal
  const selectedTxAmount = Number(selectedTx?.amount || 0)
  const selectedTxFee = Number(selectedTx?.fee || 0)
  const receiptTotalDebit = (selectedTxAmount + selectedTxFee).toFixed(2)
  const receiptTotalCredit = selectedTxAmount.toFixed(2)

  if (isLoading) {
    return (
      <div className="p-8 text-white bg-[#0b1320] min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-xs text-slate-400">Loading online banking portal...</span>
        </div>
      </div>
    )
  }

  const formatAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• 0000'
    const last4 = accNum.slice(-4)
    return `•••• ${last4}`
  }

  const renderTxIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'giftcard':
        return <Gift className="w-5 h-5 text-amber-500" />
      case 'bill':
        return <ReceiptText className="w-5 h-5 text-amber-500" />
      case 'crypto':
        return <Coins className="w-5 h-5 text-amber-500" />
      default:
        return <ArrowLeftRight className="w-5 h-5 text-amber-500" />
    }
  }

  const userFirstName = dashboardData?.users?.first_name || 'User'
  const userLastName = dashboardData?.users?.last_name || ''
  const accountsList = dashboardData?.account || []

  return (
    <div className="min-h-screen bg-[#0b1320] text-white relative pb-24 font-sans">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg text-slate-100 sm:text-xl font-bold">
              Welcome back, {userFirstName}!
            </h1>
          </div>
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center hover:opacity-95 transition cursor-pointer"
          >
            {dashboardData?.users?.profile_picture ? (
              <img src={dashboardData.users.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">
                {userFirstName[0] || 'U'}
              </span>
            )}
          </button>
        </div>

        {/* Account Cards Carousel */}
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none space-x-4 pb-4"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft
            const cardWidth = e.currentTarget.clientWidth
            if (cardWidth > 0) {
              const index = Math.round(scrollLeft / cardWidth)
              setActiveIndex(index)
            }
          }}
        >
          {accountsList.length === 0 ? (
            <div className="min-w-full rounded-2xl p-6 text-center text-slate-400 bg-[#132238] border border-slate-800">
              No account details found.
            </div>
          ) : (
            accountsList.map((acc, index) => {
              const rawVal = acc?.balance ? Number(acc.balance) : 0
              const formattedBalance = isNaN(rawVal) ? '0.00' : rawVal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })

              const accType = acc?.account_type ? acc.account_type.toUpperCase() : 'SAVINGS'

              return (
                <div
                  key={index}
                  className="min-w-full snap-center rounded-2xl p-6 shadow-xl text-white bg-[#132238] border border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">
                      {accType} ACCOUNT
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="h-6 w-6 flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer text-slate-300"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight mt-2">
                    {showBalance ? `$${formattedBalance}` : '••••••••'}
                  </h2>

                  <div className="mt-6">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">ACCOUNT NUMBER</p>
                    <p className="text-base font-mono tracking-widest mt-0.5 text-slate-200">
                      {formatAccountNumber(acc?.account_number)}
                    </p>
                  </div>

                  {/* DYNAMIC MONTHLY CREDIT & DEBIT BREAKDOWN */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                        Total Credit<br />This Month
                      </p>
                      <p className="text-sm font-bold mt-1 text-emerald-400">
                        +${monthlyCredit.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                        Total Debit<br />This Month
                      </p>
                      <p className="text-sm font-bold mt-1 text-rose-400">
                        -${monthlyDebit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quick Actions Row */}
        <div className="my-6">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/dashboard/pay')}
              className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-amber-500 rounded-2xl transition group shadow-sm cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-500">Pay</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/transfer')}
              className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-amber-500 rounded-2xl transition group shadow-sm cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <ArrowLeftRight className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-500">Transfer</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/buy-crypto')}
              className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-amber-500 rounded-2xl transition group shadow-sm cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-500 text-center">Buy Crypto</span>
            </button>

            <button
              onClick={() => setShowAll(!showAll)}
              className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-amber-500 rounded-2xl transition group shadow-sm cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showAll ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  )}
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-500">{showAll ? 'Less' : 'More'}</span>
            </button>
          </div>

          {showAll && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              <button
                onClick={() => router.push('/dashboard/check-deposit')}
                className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-emerald-500 rounded-2xl transition group shadow-sm cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-amber-500 text-center">Check Deposit</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/stocks')}
                className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-purple-500 rounded-2xl transition group shadow-sm cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-purple-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-amber-500 text-center">Stocks</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/statements')}
                className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-purple-500 rounded-2xl transition group shadow-sm cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-purple-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <ReceiptText className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-amber-500 text-center">Statements</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/support')}
                className="flex flex-col items-center justify-center p-3 bg-[#132238] border border-slate-800 hover:border-purple-500 rounded-2xl transition group shadow-sm cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-purple-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-amber-500 text-center">Support</span>
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Transactions Preview */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-wide">Recent Activity</h3>
            <button 
              onClick={() => router.push('/dashboard/transactions')}
              className="text-xs font-semibold text-amber-500 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-2 min-h-[220px]">
            {isTxLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-xs">Loading transactions...</span>
              </div>
            ) : txError ? (
              <div className="flex items-center justify-center py-10 gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs">{txError}</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent transactions available.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {transactions.slice(0, 5).map((tx) => {
                  const txStatus = tx.status || 'COMPLETED'
                  const formattedDate = tx.date
                    ? new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'

                  return (
                    <div 
                      key={tx.transaction_id || Math.random().toString()} 
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between p-3 hover:bg-slate-800/40 transition rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a2c47] flex items-center justify-center shrink-0">
                          {renderTxIcon(tx.type)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white tracking-wide">
                            {tx.beneficiary_name || tx.type || 'Transfer'}
                          </p>
                          <p className="text-[11px] text-slate-400">{formattedDate}</p>
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <p className="text-xs font-bold text-white">
                          ${Number(tx.amount || 0).toFixed(2)}
                        </p>
                        <p
                          className={`text-[10px] font-bold tracking-wider ${
                            txStatus === 'COMPLETED'
                              ? 'text-emerald-400'
                              : txStatus === 'PENDING'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {txStatus}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header / Logo */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-wider">
                VIEWMTRUST
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Official Transfer Receipt
            </h2>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold mb-6">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{selectedTx.status || 'Completed'}</span>
            </div>

            {/* Receipt Content Sections */}
            <div className="space-y-5 text-xs text-slate-600 divide-y divide-slate-100">
              {/* CONFIRMATION */}
              <div className="space-y-1.5 pt-2">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  CONFIRMATION
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-medium text-slate-800">TX-{selectedTx.reference_id || selectedTx.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-amber-600">
                    {selectedTx.status || 'Completed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.date
                      ? new Date(selectedTx.date).toLocaleString('en-US', {
                          timeZone: 'America/New_York',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.date
                      ? new Date(selectedTx.date).toLocaleString('en-US', {
                          timeZone: 'America/New_York',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* DYNAMIC TRANSFER BREAKDOWN */}
              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  TRANSFER
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium text-slate-800">{selectedTx.type || 'International Wire'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium text-slate-800">
                    ${selectedTxAmount.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee</span>
                  <span className="font-medium text-slate-800">
                    ${selectedTxFee.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 text-xs border-t border-slate-100">
                  <span>Total Debit (Sender)</span>
                  <span className="text-rose-600">-${receiptTotalDebit} USD</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span>Total Credit (Beneficiary)</span>
                  <span className="text-emerald-600">+${receiptTotalCredit} USD</span>
                </div>
              </div>

              {/* SENDER INFO */}
              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  FROM
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account name</span>
                  <span className="font-medium text-slate-800">
                    {`${userFirstName} ${userLastName}`.trim() || 'Account Holder'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account type</span>
                  <span className="font-medium text-slate-800">{selectedTx.from_a || 'Checking'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account number</span>
                  <span className="font-medium text-slate-800">
                    {formatAccountNumber(accountsList[0]?.account_number)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Routing number</span>
                  <span className="font-medium text-slate-800">{selectedTx.routing_number ? `****${selectedTx.routing_number.slice(-4)}` : '****0021'}</span>
                </div>
              </div>

              {/* RECEIVER INFO */}
              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  TO
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary</span>
                  <span className="font-medium text-slate-800">{selectedTx.beneficiary_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank</span>
                  <span className="font-medium text-slate-800">{selectedTx.bank_name || 'N/A'}</span>
                </div>
                {selectedTx.bank_address && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank address</span>
                    <span className="font-medium text-slate-800">{selectedTx.bank_address}</span>
                  </div>
                )}
                {selectedTx.swift_code && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">SWIFT/BIC</span>
                    <span className="font-medium text-slate-800">{selectedTx.swift_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.beneficiary_account ? formatAccountNumber(selectedTx.beneficiary_account) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* MEMO NOTE */}
              <div className="pt-4">
                <p className="text-[11px] font-bold text-slate-700 mb-1">Remark</p>
                <p className="text-[11px] italic text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedTx.remark ? `"${selectedTx.remark}"` : '"Keep this receipt for your records. International wires may take 1-5 business days."'}
                </p>
              </div>
            </div>

            {/* RECEIPT ACTIONS */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Floating Button */}
      <button 
        onClick={() => router.push('/dashboard/support')}
        className="fixed bottom-20 right-4 w-12 h-12 bg-amber-500 hover:bg-amber-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 transition z-20 cursor-pointer"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0d1a2d] border-t border-slate-800 px-4 flex justify-around items-center z-30">
        {[
          { id: 'home', label: 'Home', icon: Home, route: '/dashboard' },
          { id: 'loans', label: 'Loans', icon: Landmark, route: '/dashboard/loans' },
          { id: 'cards', label: 'Cards', icon: CreditCard, route: '/dashboard/cards' },
          { id: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/settings' },
        ].map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as 'home' | 'loans' | 'cards' | 'settings')
                router.push(item.route as string)
              }}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors cursor-pointer ${
                isActive ? 'text-amber-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px]">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}