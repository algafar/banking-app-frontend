'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/lib/api'

interface Account {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
}

export default function InternalTransferPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        from_account_id: '',
        account_number: '',
        amount: '',
        remark: '',
    });

    // PIN Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const selected = accounts.find((a) => String(a.account_id) === formData.from_account_id);

    useEffect(() => {
        async function loadAccounts() {
            try {
                const token = localStorage.getItem('token');
                console.log("current:", token);

                const response = await fetch(`${API_BASE_URL}/dashboard/accounts`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401) {
                    console.error("Unauthorized! Check if token is valid or expired.");
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                console.log("fetched:", data);
                setAccounts(data);
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            } finally {
                setLoading(false);
            }
        }
        loadAccounts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // STEP 1: Open Modal (Do not hit API yet)
    const handleOpenModal = () => {
        setMessage('');
        if (
            !formData.from_account_id ||
            !formData.account_number ||
            !formData.amount
        ) {
            setMessage('From account, account number, and amount are required');
            return;
        }
        setPin('');
        setPinError('');
        setShowPinModal(true);
    };

    // STEP 2: Submit API request after PIN is entered
    const handleConfirmPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            setPinError('Please enter a valid 4-digit PIN');
            return;
        }

        setSaving(true);
        setPinError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/dashboard/transfer/internal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    from_account_id: Number(formData.from_account_id),
                    account_number: formData.account_number,
                    amount: Number(formData.amount),
                    remark: formData.remark,
                    pin: pin, // Send PIN to backend for authorization
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setMessage('Wire transfer submitted successfully');
                setShowPinModal(false);
                setFormData((prev) => ({
                    ...prev,
                    account_number: '',
                    amount: '',
                    remark: '',
                }));
            } else {
                setPinError(data.detail || 'Invalid PIN or transfer failed');
            }
        } catch (err) {
            console.error(err);
            setPinError('Could not process wire transfer');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700 min-h-[900px] flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-700 transition">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold text-slate-300">Internal Transfer</h1>
                <div className="w-9" />
            </div>

            <div className="space-y-3 overflow-visible pr-1">
                <div className="block relative z-50">
                    <span className="text-xs text-slate-400 mb-1 block">From Account</span>
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-left text-slate-300"
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
                                            setFormData({ ...formData, from_account_id: String(account.account_id) });
                                            setOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition border-b border-slate-800 last:border-none"
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
                    <span className="text-xs text-slate-400 mb-1 block">IBAN or Account Number</span>
                    <input name="account_number" value={formData.account_number} onChange={handleChange} className="w-full px-4 py-3 text-slate-200 rounded-2xl bg-slate-900 border border-slate-700 text-sm outline-none focus:border-amber-500" />
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
                className="mt-6 w-full bg-amber-600 hover:bg-amber-500 font-bold py-3 rounded-xl transition shadow text-slate-950 disabled:opacity-50"
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
                        <p className="text-xs text-slate-400 mt-1 text-center">Enter your 4-digit security PIN to authorize this transfer of ${Number(formData.amount).toFixed(2)}.</p>

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

                            {pinError && <p className="text-xs text-red-400 mt-3 text-center">{pinError}</p>}

                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    {saving ? 'Verifying...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}