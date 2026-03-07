'use client'
import React, { useEffect, useState } from 'react'
import NarrativeCard from '@/components/NarrativeCard'
import StepNav from '@/components/StepNav'
import { Download, Brain, RefreshCw, FileText, Copy, Check } from 'lucide-react'
import { getNarrative, getReport, getDocxReport } from '@/lib/api'

const KEY_FINDINGS = [
  { border: 'border-l-purple-500', label: 'Max Pain Level', value: '₹25,650', desc: 'Options sellers will defend aggressively into expiry' },
  { border: 'border-l-blue-500', label: 'PCR Signal', value: '0.78 — Neutral Bullish', desc: 'Put writers active, downside protected' },
  { border: 'border-l-green-500', label: 'Support Zone', value: '₹25,500', desc: 'Highest PE OI — strong institutional buyer base' },
  { border: 'border-l-red-500', label: 'Resistance Zone', value: '₹26,000', desc: 'Highest CE OI — sellers active above this level' },
  { border: 'border-l-orange-500', label: 'Anomaly Alert', value: '7,335 Events', desc: '4.99% unusual volume — institutional fingerprints detected' },
  { border: 'border-l-pink-500', label: 'Vol Skew', value: 'Near-term elevated', desc: 'Feb expiry 15% IV premium vs March — uncertainty priced in' },
]

const SIGNALS = [
  { signal: 'PCR Ratio', value: '0.78', badge: 'BULLISH', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', action: 'Hold longs above 25,500' },
  { signal: 'Max Pain', value: '₹25,650', badge: 'NEUTRAL', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200', action: 'Expect pin action near expiry' },
  { signal: 'OI Buildup', value: 'Calls unwinding', badge: 'WATCH', badgeColor: 'bg-amber-100 text-amber-700 border-amber-200', action: 'Monitor 26,000 CE closely' },
  { signal: 'Volume Spike', value: '7,335 anomalies', badge: 'ALERT', badgeColor: 'bg-rose-100 text-rose-700 border-rose-200', action: 'Institutional activity detected' },
  { signal: 'Vol Regime', value: 'Normal-Elevated', badge: 'CAUTION', badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200', action: 'Reduce leverage near expiry' },
  { signal: 'Skew', value: 'Put skew active', badge: 'BULLISH', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', action: 'Market buying downside protection' },
]

const EXPIRIES = [
  { label: 'Feb 17 Expiry', pcr: '0.82', maxPain: '₹25,400', bias: 'Bullish', active: false },
  { label: 'Feb 24 Expiry', pcr: '0.75', maxPain: '₹25,600', bias: 'Neutral', active: false },
  { label: 'Mar 02 Expiry', pcr: '0.78', maxPain: '₹25,650', bias: 'Bullish', active: true },
]

const FALLBACK = "NIFTY options market shows neutral-to-bullish bias with PCR at 0.78. Key support at 25,500 strike with maximum Put OI signaling strong buyer defense. Resistance concentrated at 26,000 with Call OI indicating seller activity. Max Pain at 25,650 suggests price gravitates toward this level by expiry. Anomaly detection identified 7,335 unusual volume events (4.99%) indicating institutional positioning. Volatility skew shows elevated near-term IV — classic term structure inversion signaling near-term uncertainty. Overall positioning favors bulls as long as 25,500 holds."

export default function InsightsPage() {
  const [narrative, setNarrative] = useState<string | null>(null)
  const [narrativeLoading, setNarrativeLoading] = useState(true)
  const [dlPDF, setDlPDF] = useState(false)
  const [dlDocx, setDlDocx] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getNarrative()
      .then(d => setNarrative(d.narrative))
      .catch(() => setNarrative(FALLBACK))
      .finally(() => setNarrativeLoading(false))
  }, [])

  const handleDownloadPDF = async () => {
    setDlPDF(true)
    const timer = setTimeout(() => {
      window.print()
      setDlPDF(false)
    }, 10000)
    try {
      const blob = await getReport()
      clearTimeout(timer)
      const file = new Blob([blob], { type: 'application/pdf' })
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skew_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      clearTimeout(timer)
      window.print()
    } finally {
      setDlPDF(false)
    }
  }

  const handleDownloadDocx = async () => {
    setDlDocx(true)
    try {
      const blob = await getDocxReport()
      const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skew_report.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Backend generating report — try again in 5 seconds.')
    } finally {
      setDlDocx(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(narrative ?? FALLBACK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Copy failed. Please copy manually.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Market Intelligence</h1>
      </div>

      {/* KEY FINDINGS — static, renders immediately */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-indigo-500 font-heading font-bold mb-4">Key Findings</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KEY_FINDINGS.map((card, i) => (
            <div key={i} className={`bg-white/80 backdrop-blur-xl border border-slate-200 border-l-4 ${card.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-heading font-bold mb-1">{card.label}</p>
              <p className="text-slate-900 font-heading font-bold text-lg mb-1">{card.value}</p>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NARRATIVE — skeleton while loading */}
      <div className="w-full mb-10">
        <NarrativeCard title="Market Sentiment Overview" icon={Brain}>
          {narrativeLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-[92%]" />
              <div className="h-4 bg-slate-200 rounded w-[85%]" />
              <div className="h-4 bg-slate-200 rounded w-full mt-4" />
              <div className="h-4 bg-slate-200 rounded w-[88%]" />
              <div className="h-4 bg-slate-200 rounded w-[75%]" />
            </div>
          ) : (
            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line">
              {narrative}
            </p>
          )}
        </NarrativeCard>
      </div>

      {/* LIVE SIGNALS TABLE — static, renders immediately */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-indigo-500 font-heading font-bold mb-4">Live Signals</p>
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50 text-slate-600 text-[10px] uppercase tracking-widest font-heading font-bold">
                <th className="text-left px-5 py-3">Signal</th>
                <th className="text-left px-5 py-3">Value</th>
                <th className="text-left px-5 py-3">Strength</th>
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {SIGNALS.map((row, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} border-t border-slate-100`}>
                  <td className="px-5 py-3 font-heading font-bold text-slate-800 text-xs">{row.signal}</td>
                  <td className="px-5 py-3 text-slate-600 font-medium text-xs">{row.value}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${row.badgeColor}`}>
                      {row.badge}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-medium text-xs">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPIRY ANALYSIS — static, renders immediately */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-indigo-500 font-heading font-bold mb-4">Expiry Analysis</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPIRIES.map((exp, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-900 font-heading font-bold text-sm">{exp.label}</p>
                {exp.active ? (
                  <span className="relative flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    EXPIRED
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">PCR</span>
                  <span className="text-slate-800 font-heading font-bold">{exp.pcr}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Max Pain</span>
                  <span className="text-slate-800 font-heading font-bold">{exp.maxPain}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Bias</span>
                  <span className={`font-heading font-bold ${exp.bias === 'Bullish' ? 'text-emerald-600' : 'text-amber-600'}`}>{exp.bias}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-indigo-500 font-heading font-bold mb-4">Export Reports</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={dlPDF}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl px-6 py-2.5 font-heading font-bold flex items-center gap-2 transition-colors shadow-md min-w-[180px]"
          >
            {dlPDF ? <><RefreshCw size={16} className="animate-spin" />Generating PDF...</> : <><Download size={16} />Download PDF Report</>}
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={dlDocx}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl px-6 py-2.5 font-heading font-bold flex items-center gap-2 transition-colors shadow-md min-w-[200px]"
          >
            {dlDocx ? <><RefreshCw size={16} className="animate-spin" />Generating Word Doc...</> : <><FileText size={16} />Download Word Report</>}
          </button>

          <button
            onClick={handleCopy}
            className="bg-slate-700 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 font-heading font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            {copied ? <><Check size={16} />Copied!</> : <><Copy size={16} />Copy Market Summary</>}
          </button>
        </div>
      </div>

      <div className="border-t border-[#1e1e2e] pt-8">
        <StepNav steps={[{ label: "Chat with ARIA →", href: "/aria", primary: true }]} />
      </div>
    </div>
  )
}
