import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/60 p-5 flex flex-col shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-white hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)]", className)}>
      <div className="mb-4 flex items-baseline justify-between border-b border-white/40 pb-3">
        <h3 className="text-slate-900 font-heading font-bold text-sm tracking-widest uppercase">
          {title}
        </h3>
        {subtitle && <span className="text-slate-500 font-heading font-bold text-[10px] uppercase tracking-widest">{subtitle}</span>}
      </div>
      <div className="flex-1 w-full min-h-0 relative">
        {children}
      </div>
    </div>
  )
}
