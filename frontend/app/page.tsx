'use client'
import React, { useEffect, useState } from 'react'
import AuditPanel, { DataSummary } from '@/components/AuditPanel'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AuditPage() {
  const data: DataSummary = {
    total_rows: 154200,
    unique_strikes: 142,
    expiries_count: 8,
    date_range: '01-May - 31-May',
    files_loaded: ['nifty_options_data.csv', 'india_vix_history.csv', 'fii_dii_activity.csv'],
    null_counts: { iv: 12, volume: 0, oi: 0 }
  }

  return (
    <div className="relative flex flex-col items-center pt-8 pb-12 w-full max-w-5xl mx-auto overflow-hidden">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mb-24 relative z-10 px-4">
        {/* Enblox sub-header style text */}
        <div className="text-indigo-600 font-heading font-medium text-xl mb-4 tracking-wide">
          Your Data, in Perfect Rhythm.
        </div>

        <h1 className="text-6xl md:text-[5rem] font-heading font-bold text-slate-900 tracking-[-0.04em] leading-[1.05] mb-6">
          Audit Smarter, <br />
          Not Harder
        </h1>

        <p className="text-base md:text-lg text-slate-500 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
          Take control of your data with our all-in-one analysis engine.
          Instantly process option chains, track anomalies, and focus on what matters—without the overwhelm.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-8 py-3.5 rounded-full font-heading font-bold text-sm tracking-widest transition-all shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
        >
          TRY FOR FREE
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Glassmorphic Data Panel */}
      <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
        <div className="text-left mb-12 max-w-2xl px-4">
          <h2 className="text-4xl md:text-[3.5rem] font-heading font-bold text-slate-900 mb-4 tracking-[-0.02em] leading-[1.1]">
            Designed to <br /> Help You Do <br /> More <span className="text-indigo-600">With Less<br />Stress</span>
          </h2>
        </div>

        {data ? (
          <AuditPanel data={data} />
        ) : (
          <div className="w-full h-64 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-indigo-600/60 font-medium tracking-widest uppercase text-xs">Auditing Data Stream...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
