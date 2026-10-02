'use client'

import { useState } from 'react'
import Link from 'next/link'
import API_BASE_URL from '@/lib/api'
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Target,
  ArrowRight,
  User,
  Mail,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    dob: '',
    address: '',
    email: '',
    country: '',
    city: '',
    initial_balance: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          initial_balance: Number(formData.initial_balance),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || 'Registration failed'
        )
      }
      setSuccess('Account created successfully! Redirecting to setup...')
      setTimeout(() => {
        router.push('/signup')
      }, 2000)

      // Clear the form after successful registration
      setFormData({
        first_name: '',
        last_name: '',
        gender: '',
        dob: '',
        address: '',
        email: '',
        country: '',
        city: '',
        initial_balance: '',
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 font-sans selection:bg-amber-500/30 flex flex-col justify-between">
      {/* Clean White Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 md:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-wider text-slate-900 uppercase font-sans">
              VIEW<span className="text-amber-500">MTRUST</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition hidden sm:block"
            >
              Sign In
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-2 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0b1320] via-[#111c2e] to-[#0b1320]">
        <div className="w-full max-w-2xl my-auto">
          <div className="bg-[#132238] border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Decorative Top Ambient Highlight */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Section */}
            <div className="mb-2 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure Account Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Open a <span className="text-amber-400">VIEWMTRUST</span> Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Fill in your details below to establish your secure digital banking profile.
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <p className="text-xs sm:text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* SUCCESS ALERT */}
            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-xs sm:text-sm leading-relaxed">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FIRST NAME */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                      placeholder="Ada"
                    />
                  </div>
                </div>

                {/* LAST NAME */}
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                      placeholder="Okeke"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GENDER */}
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    disabled={isLoading}
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-[#0b1320] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                  >
                    <option value="" className="bg-[#0b1320] text-slate-400">
                      Select gender
                    </option>
                    <option value="female" className="bg-[#0b1320]">
                      Female
                    </option>
                    <option value="male" className="bg-[#0b1320]">
                      Male
                    </option>
                    <option value="other" className="bg-[#0b1320]">
                      Other
                    </option>
                    <option value="prefer_not_to_say" className="bg-[#0b1320]">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                {/* DATE OF BIRTH */}
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      disabled={isLoading}
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* ADDRESS */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                      placeholder="12 Example Street"
                    />
                  </div>
                </div>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COUNTRY */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="country"
                      name="country"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                      placeholder="Nigeria"
                    />
                  </div>
                </div>

                {/* CITY */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    City
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      disabled={isLoading}
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                      placeholder="Abuja"
                    />
                  </div>
                </div>
              </div>

              {/* INITIAL BALANCE */}
              <div>
                <label
                  htmlFor="initial_balance"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Initial Deposit ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    id="initial_balance"
                    name="initial_balance"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    disabled={isLoading}
                    value={formData.initial_balance}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-[#0b1320] pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

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
                      <span>Complete Registration</span>
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
                Sign in here
              </Link>
            </p>
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