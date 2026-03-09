'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart2, Search, Brain, MessageSquare } from 'lucide-react'
import SkewLogo from './SkewLogo'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function TopNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', icon: LayoutDashboard, label: 'Audit' },
        { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
        { href: '/query', icon: Search, label: 'Query' },
        { href: '/insights', icon: Brain, label: 'Insights' },
        { href: '/aria', icon: MessageSquare, label: 'ARIA' },
    ]

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[98%] max-w-6xl z-50">
            <nav className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)] transition-all">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 relative group">
                    <SkewLogo size={28} className="drop-shadow-sm transition-transform group-hover:scale-110" />
                    <span className="text-slate-900 font-heading font-bold text-xl tracking-[0.10em] uppercase">Skew</span>
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 bg-indigo-500/20 blur-xl rounded-full pointer-events-none" />
                </Link>

                {/* Links */}
                <div className="flex items-center gap-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                prefetch={true}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-heading font-bold uppercase tracking-widest transition-all duration-300 rounded-full",
                                    isActive
                                        ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20 backdrop-blur-md'
                                        : 'text-slate-700 hover:text-indigo-900 hover:bg-white/50 border border-transparent'
                                )}
                            >
                                <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {link.label}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
