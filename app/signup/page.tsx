'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Registration failed')
      }

      setSuccess('User created successfully!')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setFormData((prev) => ({
        ...prev,
        email: '',
        password: '',
        confirmPassword: '',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 font-sans selection:bg-amber-500/30 flex flex-col justify-between">
      {/* Shared Unified Header Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0b1320] via-[#111c2e] to-[#0b1320]">
        <div className="w-full max-w-md my-auto">
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Decorative Top Ambient Highlight */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* SUCCESS SCREEN */}
            {success ? (
              <div className="py-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Account Created!
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your credentials have been saved. Redirecting you to the login page...
                </p>
                <div className="pt-4 flex items-center justify-center gap-2 text-xs text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </div>
            ) : (
              /* SIGNUP FORM */
              <>
                {/* Header Section */}
                <div className="mb-8 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Account Setup
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Set Up Credentials
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
                    Create your login details to secure your <span className="text-amber-400 font-semibold">VIEWMTRUST</span> account.
                  </p>
                </div>

                {/* ERROR ALERT */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                    <p className="text-xs sm:text-sm leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={isLoading}
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* TERMS CHECKBOX */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 rounded border-slate-700 bg-[#0b1320] accent-amber-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      I agree to the{' '}
                      <Link
                        href="#"
                        className="text-amber-400 hover:text-amber-300 hover:underline transition font-medium"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="#"
                        className="text-amber-400 hover:text-amber-300 hover:underline transition font-medium"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-6 rounded-xl shadow-lg shadow-amber-500/10 border border-amber-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition"
                  >
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 md:px-12 border-t border-slate-800/80 bg-[#070d17] text-slate-400 text-xs text-center">
        <p className="text-[11px] text-slate-500">
          &copy; 2010-{new Date().getFullYear()} VIEWMTRUST Bank, N.A. Member FDIC. Equal Housing Lender.
        </p>
      </footer>
    </div>
  )
}