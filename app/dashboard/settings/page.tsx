'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LogOut,
  ShieldAlert,
  BellRing,
  Lock,
  Radio,
  KeyRound,
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  // App Preference Toggles
  const [wireTransferAlerts, setWireTransferAlerts] = useState<boolean>(true)
  const [marketingEmails, setMarketingEmails] = useState<boolean>(false)
  const [autoEmailStatements, setAutoEmailStatements] = useState<boolean>(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Settings</h1>
            <p className="text-[11px] text-slate-400 mt-1">App preferences & security</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">

        {/* Section 1: Notifications & Preferences */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Notifications & Communication
          </h3>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            {/* Instant Transfer Alerts */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instant Transfer Alerts</p>
                  <p className="text-[11px] text-slate-400">Notify on outgoing/incoming funds</p>
                </div>
              </div>

              <button
                onClick={() => setWireTransferAlerts(!wireTransferAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  wireTransferAlerts ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    wireTransferAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Email Monthly PDF Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Auto-Email Monthly Statement</p>
                  <p className="text-[11px] text-slate-400">Receive PDF summary on the 1st of every month</p>
                </div>
              </div>

              <button
                onClick={() => setAutoEmailStatements(!autoEmailStatements)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  autoEmailStatements ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    autoEmailStatements ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Communications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Marketing Communications</p>
                  <p className="text-[11px] text-slate-400">Receive promotional announcements</p>
                </div>
              </div>

              <button
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  marketingEmails ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    marketingEmails ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Transaction PIN */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Security & Authentication
          </h3>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Transaction PIN</p>
                <p className="text-[11px] text-slate-400">Set or update your 4-digit security PIN</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/settings/pin')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow"
            >
              Manage PIN
            </button>
          </div>
        </div>

        {/* Section 3: Account Controls */}
        <div className="space-y-3 pt-2">
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Account Control</h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sign out of your active session and clear authentication tokens from this device.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Current Session</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}