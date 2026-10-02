'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, Check, X, Download, Printer, ShieldAlert } from 'lucide-react';
import API_BASE_URL from '@/lib/api'

interface Account {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
}

interface Transaction {
  transaction_id?: number;
  reference_id?: string;
  from_a?: string;
  type?: string;
  beneficiary_account?: string;
  amount: number;
  beneficiary_name?: string;
  bank_name?: string;
  swift_code?: string;
  routing_number?: string;
  remark?: string;
  bank_address?: string;
  date?: string;
  status?: 'COMPLETED' | 'PENDING' | 'FAILED';
  fee?: number;
}

interface UserInfo {
  first_name?: string;
  last_name?: string;
}

export default function WireTransferPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);

    // Receipt Modal State
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    // Restriction Modal State
    const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        from_a: '', 
        bank_name: '',
        routing_number: '',
        swift_code: '',
        beneficiary_account: '',
        beneficiary_name: '',
        amount: '',
        remark: '',
    });

    // PIN Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [missingPin, setMissingPin] = useState(false);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Find selected account using account_id
    const selected = accounts.find((a) => String(a.account_id) === formData.from_a);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    router.push('/login');
                    return;
                }

                // Fetch User Info
                const userRes = await fetch(`${API_BASE_URL}/dashboard/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData?.users || null);
                }

                // Fetch Accounts
                const response = await fetch(`${API_BASE_URL}/dashboard/accounts`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }

                const data = await response.json();
                setAccounts(data);
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatAccountNumber = (accNum?: string) => {
        if (!accNum) return '•••• 0000';
        const last4 = accNum.slice(-4);
        return `•••• ${last4}`;
    };

    // STEP 1: Open PIN Modal after checking form inputs
    const handleOpenModal = () => {
        setMessage('');

        if (
            !formData.from_a ||
            !formData.bank_name ||
            !formData.beneficiary_account ||
            !formData.beneficiary_name ||
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {
            setMessage('Please select an account and fill in all required fields.');
            return;
        }

        setPin('');
        setPinError('');
        setMissingPin(false);
        setShowPinModal(true);
    };

    // STEP 2: Submit request with PIN and pop up Receipt Modal on Success
    const handleConfirmPin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pin || pin.length < 4) {
            setPinError('Please enter a valid 4-digit PIN');
            return;
        }

        setSaving(true);
        setPinError('');
        setMissingPin(false);

        try {
            const token = localStorage.getItem('token');

            const payload = {
                from_a: selected ? selected.account_id : Number(formData.from_a),
                bank_name: formData.bank_name,
                routing_number: formData.routing_number,
                swift_code: formData.swift_code,
                beneficiary_account: formData.beneficiary_account,
                beneficiary_name: formData.beneficiary_name,
                amount: Number(formData.amount),
                remark: formData.remark,
                pin: pin.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/dashboard/transfer/wire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setShowPinModal(false);

                // Populate transaction receipt with response data or current inputs fallback
                const createdTx: Transaction = {
                    transaction_id: data.transaction_id || data.id,
                    reference_id: data.reference_id || '523FEACC',
                    from_a: selected ? selected.account_type : 'Checking',
                    type: 'Wire Transfer',
                    beneficiary_account: formData.beneficiary_account,
                    beneficiary_name: formData.beneficiary_name,
                    bank_name: formData.bank_name,
                    swift_code: formData.swift_code,
                    routing_number: formData.routing_number,
                    amount: Number(formData.amount),
                    remark: formData.remark,
                    date: data.date || new Date().toISOString(),
                    status: data.status || 'PENDING',
                    fee: data.fee || 0,
                };

                // Clear form inputs
                setFormData({
                    from_a: '',
                    bank_name: '',
                    routing_number: '',
                    swift_code: '',
                    beneficiary_account: '',
                    beneficiary_name: '',
                    amount: '',
                    remark: '',
                });

                // Display Receipt Modal
                setSelectedTx(createdTx);
            } else {
                // Check if the backend sent a 400 status for frozen/restricted accounts
                if (response.status === 400) {
                    setShowPinModal(false);
                    setIsRestrictedModalOpen(true);
                    return;
                }

                const rawerror = data.detail || data.message || '';
                const errorMessage = typeof rawerror === 'string'
                    ? rawerror
                    : Array.isArray(rawerror)
                        ? rawerror[0]?.msg || JSON.stringify(rawerror)
                        : JSON.stringify(rawerror);
                
                const lowerMessage = errorMessage.toLowerCase();

                // Only set missing PIN if explicit backend error returned
                if (
                    lowerMessage.includes('pin') && 
                    (lowerMessage.includes('not found') || lowerMessage.includes('set') || lowerMessage.includes('create'))
                ) {
                    setMissingPin(true);
                    setPinError('No transaction PIN setup found for this account.');
                } else {
                    setPinError(errorMessage || `Wire transfer failed (Status ${response.status})`);
                }
            }
        } catch (err) {
            console.error('Submission error:', err);
            setPinError('Could not process wire transfer. Check backend server connection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700 min-h-[900px] flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-700 transition cursor-pointer">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold text-slate-300">Wire Transfer</h1>
                <div className="w-9" />
            </div>

            <div className="space-y-3 overflow-visible pr-1">
                {/* Account Selection */}
                <div className="block relative z-50">
                    <span className="text-xs text-slate-400 mb-1 block">From Account</span>
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-left text-slate-300 cursor-pointer"
                    >
                        {loading ? 'Loading accounts...' : 
                            selected ? (
                                <span className="flex items-center justify-between">
                                    <span className="capitalize">
                                        {selected.account_type} ••{selected.account_number.slice(-4)}
                                    </span>
                                    <span className="text-slate-400">${Number(selected.balance).toFixed(2)}</span>
                                </span>
                            ) : accounts.length > 0 ? (
                                'Select an account'
                            ) : (
                                'No checking or savings account'
                            )
                        }
                    </button>

                    {open && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl max-h-60 overflow-y-auto">
                            {accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <button
                                        key={account.account_id}
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, from_a: String(account.account_id) }));
                                            setOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition border-b border-slate-800 last:border-none cursor-pointer"
                                    >
                                        <div>
                                            <p className="text-xs font-medium text-slate-200 capitalize">{account.account_type}</p>
                                            <p className="text-[11px] text-slate-400">••••{account.account_number.slice(-4)}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-200">
                                            ${Number(account.balance).toFixed(2)}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-xs text-slate-400">No accounts found</div>
                            )}
                        </div>
                    )}            
                </div>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Bank Name</span>
                    <input name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Routing Transit Number</span>
                    <input name="routing_number" value={formData.routing_number} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">SWIFT/BIC</span>
                    <input name="swift_code" value={formData.swift_code} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">IBAN or Account Number</span>
                    <input name="beneficiary_account" value={formData.beneficiary_account} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Account Name</span>
                    <input name="beneficiary_name" value={formData.beneficiary_name} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Amount</span>
                    <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange} placeholder="$0.00" className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
                </label>

                <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Remark</span>
                    <textarea name="remark" value={formData.remark} onChange={handleChange} rows={2} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none resize-none focus:border-amber-500" />
                </label>

                {message && <p className="text-xs text-center text-amber-400 mt-2">{message}</p>}
            </div>

            <button
                type="button"
                onClick={handleOpenModal}
                disabled={saving || loading || !selected}
                className="mt-6 w-full bg-amber-600 hover:bg-amber-500 font-bold py-3 rounded-xl transition shadow text-slate-950 disabled:opacity-50 cursor-pointer"
            >
                Send Wire Transfer
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-3">International wires may take 1–5 business days</p>

            {/* PIN VERIFICATION MODAL */}
            {showPinModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-100">Enter Transaction PIN</h3>
                        <p className="text-xs text-slate-400 mt-1 text-center">
                            Enter your 4-digit security PIN to authorize this transfer of ${Number(formData.amount).toFixed(2)}.
                        </p>

                        <form onSubmit={handleConfirmPin} className="w-full flex flex-col items-center mt-6">
                            <input
                                type="password"
                                maxLength={4}
                                autoFocus
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-36 text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-amber-500 outline-none focus:border-amber-500"
                                placeholder="••••"
                            />

                            {pinError && (
                                <div className="mt-3 text-center">
                                    <p className="text-xs text-red-400">{pinError}</p>
                                    {missingPin && (
                                        <Link 
                                            href="/dashboard/settings/pin" 
                                            className="inline-block mt-2 text-xs text-amber-400 underline hover:text-amber-300"
                                        >
                                            Set up a transaction PIN here
                                        </Link>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? 'Verifying...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ACCOUNT RESTRICTION NOTICE MODAL */}
            {isRestrictedModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setIsRestrictedModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Icon & Header */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-base font-bold text-slate-100 mb-1">
                                Account Restriction Notice
                            </h3>
                            <p className="text-xs text-red-400/90 font-medium mb-4">
                                Transaction Declined
                            </p>

                            {/* Exact professional restriction message */}
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 mb-6 leading-relaxed space-y-2 text-left">
                                <p>Your wire transfer could not be completed at this time. For your security and compliance with regulatory standards, your account has been temporarily restricted.</p>
                                <p>Please reach out to our Customer Support team immediately for assistance in resolving this matter.</p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => router.push('/dashboard/support')}
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow"
                                >
                                    Contact Support
                                </button>
                                <button
                                    onClick={() => setIsRestrictedModalOpen(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* IDENTICAL RECEIPT MODAL */}
            {selectedTx && (
                <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold mb-6 ${
                            selectedTx.status === 'COMPLETED' ? 'bg-emerald-600' : selectedTx.status === 'PENDING' ? 'bg-amber-600' : 'bg-rose-600'
                        }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span className="capitalize">{selectedTx.status || 'Pending'}</span>
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
                                    <span className="font-semibold text-amber-600 capitalize">
                                        {selectedTx.status || 'Pending'}
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
                                    <span className="font-medium text-slate-800 capitalize">{selectedTx.from_a || 'Checking'}</span>
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
    );
}