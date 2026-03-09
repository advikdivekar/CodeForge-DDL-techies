'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart2, Search, Brain, MessageSquare } from 'lucide-react'
import SkewLogo from './SkewLogo'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/', icon: LayoutDashboard, label: 'Audit' },
    { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { href: '/query', icon: Search, label: 'Query' },
    { href: '/insights', icon: Brain, label: 'Insights' },
    { href: '/aria', icon: MessageSquare, label: 'ARIA' },
  ]

  return (
    <div className="fixed left-0 top-0 h-screen w-[240px] bg-white/20 backdrop-blur-2xl border-r border-white/40 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/20 relative overflow-hidden">
        <SkewLogo size={28} className="drop-shadow-sm z-10" />
        <span className="text-slate-900 font-heading font-bold text-xl tracking-[0.10em] uppercase z-10">Skew</span>

        {/* Subtle top left glow behind the logo */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full pointer-events-none" />
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-8">
        {links.map((link) => {
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 rounded-lg ${isActive
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
            >
              <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="text-slate-400 font-mono text-[9px] uppercase tracking-widest text-center">Powered by Skew AI</div>
      </div>
    </div>
  )
}
