'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  ArrowLeftRight,
  Gift,
  ReceiptText,
  Coins,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Download,
  Printer,
  Target,
} from 'lucide-react'

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

interface UserInfo {
  first_name?: string
  last_name?: string
}

export default function AllTransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Receipt Modal State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch User Info
        const userRes = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (userRes.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData?.users || null)
        }

        // Fetch Transactions History
        const txRes = await fetch(`${API_BASE_URL}/dashboard/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!txRes.ok) {
          throw new Error('Failed to load transaction history')
        }

        const txData = await txRes.json()
        const txList = Array.isArray(txData) ? txData : []
        setTransactions(txList)
        setFilteredTransactions(txList)
      } catch (err: any) {
        console.error('Transactions fetch error:', err)
        setError('Could not fetch transaction history.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Handle Search and Filter logic
  useEffect(() => {
    let result = [...transactions]

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.beneficiary_name?.toLowerCase().includes(q) ||
          tx.bank_name?.toLowerCase().includes(q) ||
          tx.type?.toLowerCase().includes(q) ||
          tx.transaction_id.toString().includes(q)
      )
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(
        (tx) => (tx.status || 'COMPLETED').toUpperCase() === statusFilter
      )
    }

    setFilteredTransactions(result)
  }, [searchQuery, statusFilter, transactions])

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

  const formatAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• 0000'
    const last4 = accNum.slice(-4)
    return `•••• ${last4}`
  }

  return (
    <div className="min-h-screen bg-[#0b1320] text-white p-4 sm:p-6 lg:p-8 font-sans pb-16">
      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header & Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-xl bg-[#132238] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-500/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">All Transactions</h1>
            <p className="text-xs text-slate-400">View details and download official receipts</p>
          </div>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search beneficiary, bank, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#132238] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#132238] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions List View */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-3 min-h-[420px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
              <span className="text-xs">Loading history...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <span className="text-xs">{error}</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-xs">
              No transactions match your search filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredTransactions.map((tx) => {
                const txStatus = tx.status || 'COMPLETED'
                const formattedDate = tx.date
                  ? new Date(tx.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Sep 28, 2026'

                return (
                  <div
                    key={tx.transaction_id || Math.random().toString()}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-800/40 transition rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#1a2c47] flex items-center justify-center shrink-0">
                        {renderTxIcon(tx.type)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white tracking-wide">
                          {tx.beneficiary_name || tx.type || 'Transfer'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {tx.bank_name ? `${tx.bank_name} • ` : ''}{formattedDate}
                        </p>
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
      </main>

      {/* IDENTICAL RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header / Brand Logo */}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold mb-6">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{selectedTx.status || 'Completed'}</span>
            </div>

            {/* Receipt Details Breakdown */}
            <div className="space-y-5 text-xs text-slate-600 divide-y divide-slate-100">
              {/* CONFIRMATION */}
              <div className="space-y-1.5 pt-2">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  CONFIRMATION
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-medium text-slate-800">TX-{selectedTx.reference_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedTx.status || 'Completed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.date
                      ? new Date(selectedTx.date).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Sep 28, 2026 10:22 PM EDT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.date
                      ? new Date(selectedTx.date).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Sep 28, 2026 10:22 PM EDT'}
                  </span>
                </div>
              </div>

              {/* TRANSFER */}
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
                    ${Number(selectedTx.amount || 0).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee</span>
                  <span className="font-medium text-slate-800">
                    ${Number(selectedTx.fee || 0).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 text-sm">
                  <span>Total debit</span>
                  <span>
                    ${(Number(selectedTx.amount || 0) + Number(selectedTx.fee || 0)).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* FROM (SENDER) */}
              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-slate-900 text-[11px] tracking-wider uppercase mb-2">
                  FROM
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account name</span>
                  <span className="font-medium text-slate-800">
                    {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Account Holder'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account type</span>
                  <span className="font-medium text-slate-800">{selectedTx.from_a || 'Checking'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Routing number</span>
                  <span className="font-medium text-slate-800">
                    {selectedTx.routing_number ? `****${selectedTx.routing_number.slice(-4)}` : '****0021'}
                  </span>
                </div>
              </div>

              {/* TO (BENEFICIARY) */}
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

              {/* MEMO */}
              <div className="pt-4">
                <p className="text-[11px] font-bold text-slate-700 mb-1">Remark / Memo</p>
                <p className="text-[11px] italic text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedTx.remark ? `"${selectedTx.remark}"` : '"Keep this receipt for your records. International wires may take 1-5 business days."'}
                </p>
              </div>
            </div>

            {/* RECEIPT ACTIONS (DOWNLOAD & PRINT) */}
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
    </div>
  )
}