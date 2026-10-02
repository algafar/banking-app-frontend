'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/lib/api'

export default function SetPinPage() {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4 || confirmPin.length < 4) {
            setMessage('PIN must be 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            setMessage('PINs do not match');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/dashboard/settings/pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ pin }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setMessage('PIN set successfully!...');
            } else {
                setMessage(data.detail || 'Failed to set PIN');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700 min-h-[900px] flex flex-col relative text-slate-100">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-700 transition">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold text-slate-300">Security Settings</h1>
                <div className="w-9" />
            </div>

            {/* Form Container */}
            <div className="max-w-md w-full mx-auto mt-20 flex flex-col items-center">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold mb-1">Create Transaction PIN</h2>
                <p className="text-xs text-slate-400 mb-8 text-center">Set a 4-digit security PIN to authorize your ongoing fund transfer and future transactions.</p>

                <form onSubmit={handleSetPin} className="w-full space-y-5">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">New 4-Digit PIN</label>
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-center text-xl tracking-[0.5em] text-amber-500 outline-none focus:border-amber-500 font-bold"
                            placeholder="••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Confirm PIN</label>
                        <input
                            type="password"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-center text-xl tracking-[0.5em] text-amber-500 outline-none focus:border-amber-500 font-bold"
                            placeholder="••••"
                        />
                    </div>

                    {message && <p className="text-xs text-center text-amber-400">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 mt-4 shadow"
                    >
                        {loading ? 'Saving PIN...' : 'Save PIN'}
                    </button>
                </form>
            </div>
        </div>
    );
}