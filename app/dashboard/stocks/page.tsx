'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    shares?: number;
}

export default function StocksPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings');

    const holdings: Stock[] = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: +1.24, shares: 0 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 214.80, change: -2.15, shares: 2 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: +0.85, shares: 2 },
    ];

    const watchlist: Stock[] = [
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: +4.65 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.75, change: +0.45 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.10, change: -0.32 },
    ];

    const totalPortfolioValue = holdings.reduce((acc, stock) => acc + (stock.price * (stock.shares || 0)), 0);

    return (
        <div className="w-full  min-h-[900px] bg-slate-800 text-white p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => router.back()} className="p-2 rounded-full  hover:bg-white transition">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                </button>
                <h1 className="text-base font-semibold text-slate-400">Stock Portfolio</h1>
                <div className="w-9" />
            </div>
        <p className="text-xs text-slate-400 text-center mb-6 mt-2">Manage your investments and watchlist.</p>
            
            {/* Portfolio Summary Card */}
            <div className="bg-black border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-medium text-slate-400">Total Portfolio Value</span>
                <h3 className="text-2xl font-bold text-white mt-1">
                    ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-medium">
                        +2.4% ($245.50)
                    </span>
                    <span className="text-xs text-slate-400">Today</span>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-black border border-slate-800 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('holdings')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        activeTab === 'holdings' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    My Holdings
                </button>
                <button
                    onClick={() => setActiveTab('watchlist')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                        activeTab === 'watchlist' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Watchlist
                </button>
            </div>

            {/* Stock List */}
            <div className="space-y-3">
                {(activeTab === 'holdings' ? holdings : watchlist).map((stock) => {
                    const isPositive = stock.change >= 0;
                    return (
                        <div 
                            key={stock.symbol}
                            className="bg-black border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{stock.symbol}</span>
                                    {stock.shares && (
                                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                            {stock.shares} sh
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{stock.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</div>
                                <div className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isPositive ? '+' : ''}{stock.change}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}