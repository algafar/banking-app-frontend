import Link from 'next/link'
import {
  LogIn,
  Shield,
  TrendingUp,
  Send,
  Eye,
  Lock,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Focus,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'VIEWMTRUST - Premier Digital Banking',
  description: 'Secure, fast, and intuitive digital banking built on trust and focus.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Clean White Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 md:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* VIEWMTRUST Brand with Target Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-wider text-slate-900 uppercase font-sans">
              VIEW<span className="text-amber-500">MTRUST</span>
            </span>
          </Link>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 sm:block"
            >
              Sign In
            </Link>
            <Link href="/registration">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
              >
                Open Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-28 px-6 md:px-12 overflow-hidden border-b border-amber-500/15 bg-gradient-to-b from-[#0b1320] via-[#111c2e] to-[#0b1320]">
          {/* Subtle Institutional Focus Watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none">
            <Focus className="w-[600px] h-[600px] text-amber-400" />
          </div>

          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 z-10 relative">
            <div className="w-full md:w-7/12 min-w-0 flex flex-col items-start text-left space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Focused on Your Financial Success • Member FDIC
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white">
                Modern Innovation Meets <span className="text-amber-400 font-serif italic">Unwavering Trust.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
                Experience premier online banking tailored around your goals. 
                Manage wealth, transfer seamlessly, and access secure vault tools anytime, anywhere.
              </p>

              {/* Primary Call to Action */}
              <div className="w-full sm:w-auto pt-2">
                <Link href="/registration" className="block w-full sm:inline-block">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-6 rounded-xl shadow-lg shadow-amber-500/10 border border-amber-400/30 transition-all flex items-center justify-center gap-3">
                    <span>Open a VIEWMTRUST Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Authentication Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {/* Sign In */}
                <Link href="/signup" className="min-w-0">
                  <div className="group h-full bg-[#132238] hover:bg-[#182a45] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          Account Registration
                        </p>
                        <p className="truncate text-[10px] text-slate-400 mt-0.5">
                          Enroll for online access.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                {/* Log In */}
                <Link href="/login" className="min-w-0">
                  <div className="group h-full bg-[#132238] hover:bg-[#182a45] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <LogIn className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          Secure Sign In
                        </p>
                        <p className="truncate text-[10px] text-slate-400 mt-0.5">
                          Access your existing accounts.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="w-full md:w-5/12 min-w-0 flex justify-center md:justify-end">
              <div className="relative group max-w-md w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#111c2e] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl p-2">
                  <img
                    src="couples.jpeg"
                    alt="VIEWMTRUST Digital Banking Experience"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                  
                  {/* Floating Shield Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#0b1320]/90 backdrop-blur-md border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight">256-Bit Encrypted</p>
                        <p className="text-[9px] text-slate-400 font-mono">2FA Multi-Factor Active</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      SSL SECURE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b1320]">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Target className="w-4 h-4" /> Focused Banking Standards
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl text-white">
                Why Choose <span className="text-amber-400">VIEWMTRUST</span>?
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
                Combining institutional-grade financial security with focused, next-generation digital banking technology.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature Cards */}
              <div className="bg-[#132238] border border-slate-800 hover:border-amber-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-amber-500/10 p-3.5 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-amber-400 transition-colors">Instant Transfers</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send funds across domestic and international accounts with real-time settlement and zero hidden fees.
                </p>
              </div>

              <div className="bg-[#132238] border border-slate-800 hover:border-blue-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-blue-500/10 p-3.5 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-blue-400 transition-colors">Smart Analytics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gain immediate clarity into spending trends, cash flow tracking, and automated portfolio reports.
                </p>
              </div>

              <div className="bg-[#132238] border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-emerald-500/10 p-3.5 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Shield className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Bank-Level Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-tier encryption protocols, biometric authentication, and active fraud detection protect your wealth.
                </p>
              </div>

              <div className="bg-[#132238] border border-slate-800 hover:border-purple-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-purple-500/10 p-3.5 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Eye className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-purple-400 transition-colors">Full Transparency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clear, itemized transaction records with digital receipts and verifiable ledger histories.
                </p>
              </div>

              <div className="bg-[#132238] border border-slate-800 hover:border-amber-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-amber-500/10 p-3.5 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Send className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-amber-400 transition-colors">Easy Integration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect third-party accounting, merchant payment gateways, and personal finance software seamlessly.
                </p>
              </div>

              <div className="bg-[#132238] border border-slate-800 hover:border-rose-500/30 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-rose-500/10 p-3.5 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <Lock className="size-6" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white group-hover:text-rose-400 transition-colors">Privacy First</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict client privacy compliance. We never sell, monetize, or disclose your financial records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative border-y border-amber-500/20 bg-gradient-to-r from-[#111c2e] via-[#16253d] to-[#111c2e] py-16 sm:py-24 overflow-hidden">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 relative z-10 space-y-6">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Focused Wealth Management
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Experience VIEWMTRUST?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
              Join thousands of client accounts who rely on VIEWMTRUST for security, growth, and absolute clarity.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-6 rounded-xl shadow-xl shadow-amber-500/20 transition cursor-pointer inline-flex items-center gap-2">
                  <span>Get Started in Minutes</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Banking Footer */}
        <footer className="w-full py-10 px-6 md:px-12 border-t border-slate-800/80 bg-[#070d17] text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs space-y-6 md:space-y-0">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm">
                <Target className="w-4 h-4 text-amber-400" />
                VIEWMTRUST BANK
              </div>
              <p className="text-[11px] text-slate-500">
                &copy; 2010-{new Date().getFullYear()} VIEWMTRUST Bank, N.A. All rights reserved.
              </p>
            </div>

            <div className="text-center md:text-right max-w-xl space-y-1.5">
              <p className="font-semibold text-slate-300">
                Member FDIC. &nbsp;|&nbsp; <span className="inline-block text-amber-400">⚖️ Equal Housing Lender</span>
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Banking products and deposit services are provided by VIEWMTRUST Bank, N.A., Member FDIC. 
                Deposit products are insured up to standard allowable FDIC coverage limits.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}