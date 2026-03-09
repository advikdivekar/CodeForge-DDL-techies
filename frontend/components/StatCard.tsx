import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red'
  className?: string
}

const colorMap = {
  purple: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
  blue: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  orange: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  red: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
}

export default function StatCard({ title, value, subtitle, color, className }: StatCardProps) {
  return (
    <div className={cn("bg-white/60 backdrop-blur-2xl rounded-2xl p-5 border border-white/60 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 hover:border-white hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5", className)}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn("w-1.5 h-1.5 rounded-full", colorMap[color])} />
        <span className="text-slate-500 text-[11px] font-heading font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-slate-900 font-heading font-bold text-3xl tracking-tight mb-2">{value}</div>
      <div className="text-slate-400 font-heading font-medium text-[10px] uppercase tracking-widest truncate">{subtitle}</div>
    </div>
  )
}
