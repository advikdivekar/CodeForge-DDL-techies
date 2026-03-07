'use client'
import React, { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface PCRData {
  last_pcr: number
  signal: 'bullish' | 'bearish' | 'neutral'
  interpretation: string
}

export default function PCRInterpretation({ className }: { className?: string }) {
  const [data, setData] = useState<PCRData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/charts/pcr')
      .then(res => res.json())
      .then(res => {
        const pcrValues: (number | null)[] = res.pcr_values || []
        const timestamps: string[] = res.timestamps || []
        const signals: Record<string, string> = res.signals || {}

        let lastPcr = 0
        let rawSignal = 'neutral'
        for (let i = pcrValues.length - 1; i >= 0; i--) {
          if (pcrValues[i] != null) {
            lastPcr = pcrValues[i] as number
            rawSignal = signals[timestamps[i]] || 'neutral'
            break
          }
        }

        const signal: 'bullish' | 'bearish' | 'neutral' =
          rawSignal.includes('bullish') ? 'bullish' :
          rawSignal.includes('bearish') ? 'bearish' : 'neutral'

        const interpretationMap: Record<string, string> = {
          bullish: 'Higher put writing signals bullish sentiment. Options sellers expect the market to hold support and continue higher.',
          bearish: 'Elevated call writing indicates bearish or cautious sentiment. Market participants are hedging against further downside.',
          neutral: 'PCR is in a balanced zone. Markets are in a wait-and-watch mode with no strong directional bias.'
        }

        setData({ last_pcr: lastPcr, signal, interpretation: interpretationMap[signal] })
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className={cn("bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/60 p-6 flex flex-col justify-center shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)]", className)}>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 bg-white/60 rounded w-24"></div>
          <div className="h-6 bg-white/60 rounded w-16"></div>
          <div className="h-4 bg-white/60 rounded w-full"></div>
          <div className="h-4 bg-white/60 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/60 p-6 flex flex-col justify-center shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)] transition-all hover:border-white hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)]", className)}>
      <div className="flex items-center gap-2 text-slate-600 font-heading font-bold tracking-widest uppercase mb-4 text-xs">
        <Activity className="w-4 h-4" /> Current PCR Value
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-heading font-bold text-slate-900 drop-shadow-sm">
          {data.last_pcr.toFixed(2)}
        </div>
        <div className={cn(
          "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
          data.signal === 'bullish' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]" :
            data.signal === 'bearish' ? "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]" :
              "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        )}>
          {data.signal}
        </div>
      </div>

      <p className="text-slate-700 text-sm leading-relaxed mt-2 pt-4 border-t border-white/40 font-medium">
        {data.interpretation}
      </p>
    </div>
  )
}
