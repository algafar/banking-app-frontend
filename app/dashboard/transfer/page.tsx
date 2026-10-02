'use client';

import { useRouter } from 'next/navigation';

const options = [
  {
    href: '/dashboard/transfer/internal',
    title: 'Internal Transfer',
    subtitle: 'Send to accounts in this app',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582M20 20v-5h-.581M5.5 9A7.5 7.5 0 0119 8m-1.5 7A7.5 7.5 0 015 16" />
      </svg>
    ),
  },
  {
    href: '/dashboard/transfer/local',
    title: 'Local Transfer',
    subtitle: 'Send to a bank in your country',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V10l8-5 8 5v11M8 21v-6h8v6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/transfer/wire',
    title: 'Wire Transfer',
    subtitle: 'Send internationally',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.5 2.5 12.5 0 18m0-18c-2.5 2.5-2.5 12.5 0 18M3 12h18" />
      </svg>
    ),
  },
];

export default function TransferPage() {
  const router = useRouter();

  return (
    <div className="w-full bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[900px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-slate-400">Transfer</h1>
        <div className="w-9" />
      </div>
      <p className="text-xs text-slate-400 text-center mb-6">Choose a transfer type</p>

      <div className="space-y-3 mt-4">
        {options.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center justify-between mt-6 p-4 bg-slate-800 rounded-2xl border border-slate-100"
          >
            <div className="flex items-center text-black space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 ">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-white text-slate-800">{item.title}</p>
                <p className="text-[11px] text-slate-400">{item.subtitle}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}