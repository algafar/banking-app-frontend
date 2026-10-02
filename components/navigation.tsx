'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Send,
  History,
  User,
  LogOut,
  Menu,
  X,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  isAuthenticated?: boolean
  currentPath?: string
  onLogout?: () => void
}

const Navigation = ({
  isAuthenticated = false,
  currentPath = '/',
  onLogout,
}: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/transfer', label: 'Transfer', icon: Send },
    { href: '/dashboard/transactions', label: 'Transactions', icon: History },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ]

  const isActive = (href: string) => currentPath === href

  // Unauthenticated Header - Keeps Sign In & Open Account locked across all public pages
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 md:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* VIEWMTRUST Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-wider text-slate-900 uppercase font-sans">
              VIEW<span className="text-amber-500">MTRUST</span>
            </span>
          </Link>

          {/* Locked Header Navigation Links */}
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
    )
  }

  // Authenticated Dashboard Navigation
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 border-r bg-[#0b1320] text-slate-100 border-slate-800 lg:block">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 p-4 font-bold text-lg">
              <Target className="w-5 h-5 text-amber-400" />
              <span>VIEWMTRUST</span>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive(item.href)
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-slate-800 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs font-semibold"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0b1320] lg:hidden text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Target className="size-6 text-amber-400" />
            <span className="text-sm font-bold tracking-wider">VIEWMTRUST</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </Button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-800 p-4 bg-[#0b1320] space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs font-semibold mt-2"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onLogout) onLogout();
              }}
            >
              <LogOut className="size-4" />
              Log Out
            </Button>
          </nav>
        )}
      </header>
    </>
  )
}

export default Navigation