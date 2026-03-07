import React from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export interface DataSummary {
  total_rows: number
  unique_strikes: number
  expiries_count: number
  date_range: string
  files_loaded: string[]
  null_counts: Record<string, number>
}

// Custom specialized StatCard for the landing page vibe
function GlassStatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white p-6 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1">
      <div className="text-slate-900 font-heading font-bold text-lg mb-2">{title}</div>
      <div className="text-slate-500 font-medium text-sm leading-relaxed mb-4">{subtitle}</div>
      <div className="text-slate-900 font-heading font-bold text-2xl tracking-[-0.02em]">{value}</div>
    </div>
  )
}

export default function AuditPanel({ data }: { data: DataSummary }) {
  const hasNulls = Object.values(data.null_counts).some(count => count > 0)

  return (
    <div className="w-full space-y-8 pb-20">
      {/* 4-column Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <GlassStatCard title="Smart Data Ingestion" value={data.total_rows} subtitle="Easily interpret, categorize, and prioritize rows with a simple ingestion engine that adapts to your workflow." />
        <GlassStatCard title="Strike Identification" value={data.unique_strikes} subtitle="Stay ahead of your schedule with a built-in calendar that syncs across all your devices and reminds you before deadlines hit." />
        <GlassStatCard title="Contract Alignment" value={data.expiries_count} subtitle="Eliminate distractions with a minimal UI layout and time-blocking tools that help you finish your tasks—fast." />
        <GlassStatCard title="Time Horizon" value={data.date_range} subtitle="Analyze the complete trading window seamlessly with pinpoint accurate date parsing." />
      </div>

      {/* Files & Quality Panel */}
      <div className="mx-4 mt-16 bg-white/90 backdrop-blur-3xl border border-white p-10 rounded-[2.5rem] shadow-[0_12px_48px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h3 className="text-slate-900 font-heading font-bold text-2xl tracking-[-0.02em] mb-8">Files Loaded</h3>
          <ul className="space-y-5">
            {data.files_loaded.map((file, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-slate-100 last:border-0 pb-5 last:pb-0">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="text-white w-3 h-3" strokeWidth={3} />
                </div>
                <span className="text-slate-700 font-heading font-bold text-sm tracking-wide">{file}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-slate-900 font-heading font-bold text-2xl tracking-[-0.02em] mb-8">Integrity Check</h3>
          {hasNulls ? (
            <div className="p-6 rounded-3xl bg-[#fff0f0] border border-[#ffe0e0] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="text-red-500 w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold mb-2">Missing Values Detected</h4>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  The system detected incomplete fields during ingestion.
                </p>
                <ul className="space-y-2">
                  {Object.entries(data.null_counts).filter(([_, v]) => v > 0).map(([key, value]) => (
                    <li key={key} className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-lg inline-flex mr-2">
                      <span className="uppercase mr-1">{key}:</span> {value} nulls
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-slate-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold mb-1">Passes All Checks</h4>
                <p className="text-slate-500 text-sm">Data is pristine. 0 missing values detected.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
