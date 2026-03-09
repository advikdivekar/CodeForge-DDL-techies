'use client'
import React, { useState } from 'react'
import { Search, Sparkles, ArrowRight, Activity, TrendingUp, BarChart2, RefreshCw } from 'lucide-react'
import { postQuery } from '@/lib/api'

export default function QueryPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ q: string; a: string }[]>([])

  const suggestions = [
    { icon: Activity, text: "What is the max pain for 01-May expiry?" },
    { icon: TrendingUp, text: "Which strikes have the highest short buildup in NIFTY?" },
    { icon: BarChart2, text: "Analyze the PCR divergence over the last 30 minutes." },
    { icon: Sparkles, text: "Show me volume anomalies on BankNifty calls." }
  ]

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim() || loading) return
    const q = query.trim()
    setQuery('')
    setLoading(true)
    try {
      const res = await postQuery(q)
      setHistory(h => [...h, { q, a: res.answer }])
    } catch {
      setHistory(h => [...h, { q, a: 'Error getting answer. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pt-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-[3.5rem] font-heading font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">Natural Language Query</h1>
        <p className="text-slate-500 text-lg font-medium">Query options data instantly using everyday language.</p>
      </div>

      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm mb-12 relative transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-300">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="pl-4 pr-3 text-indigo-400">
            <Search size={24} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about PCR, max pain, open interest buildups..."
            className="flex-1 bg-transparent border-none text-slate-900 text-lg px-2 py-4 focus:outline-none placeholder-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl px-6 py-4 font-heading font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <><span>Ask Skew</span><ArrowRight size={18} /></>}
          </button>
        </form>
      </div>

      {history.length > 0 && (
        <div className="mb-12 space-y-6">
          {history.map((item, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] font-heading font-medium text-sm shadow-md">
                  {item.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] text-slate-800 text-sm leading-relaxed font-medium shadow-sm">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm text-slate-400 text-sm flex items-center gap-2 shadow-sm">
                <RefreshCw size={14} className="animate-spin text-indigo-500" />
                Analyzing...
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-slate-500 font-heading font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-500" />
          Suggested Queries
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setQuery(suggestion.text)}
              className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-left group"
            >
              <div className="mt-0.5 text-indigo-400 group-hover:text-indigo-600 transition-colors">
                <suggestion.icon size={18} />
              </div>
              <span className="text-slate-700 font-heading font-medium group-hover:text-slate-900 transition-colors">
                {suggestion.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
