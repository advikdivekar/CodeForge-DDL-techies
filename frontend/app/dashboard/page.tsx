'use client'
import React, { useState } from 'react'
import StatCard from '@/components/StatCard'
import StepNav from '@/components/StepNav'
import PCRInterpretation from '@/components/PCRInterpretation'
import { ImageDown, RefreshCw } from 'lucide-react'

import OIHeatmap from '@/components/charts/OIHeatmap'
import PCRChart from '@/components/charts/PCRChart'
import VolumeSpikes from '@/components/charts/VolumeSpikes'
import OIDistribution from '@/components/charts/OIDistribution'
import VolatilitySkew from '@/components/charts/VolatilitySkew'
import MaxPain from '@/components/charts/MaxPain'
import OIChange from '@/components/charts/OIChange'
import VolatilitySurface from '@/components/charts/VolatilitySurface'

export default function DashboardPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadAllCharts = async () => {
    setDownloading(true)
    try {
      const plotDivs = document.querySelectorAll<HTMLElement>('.js-plotly-plot')
      const chartNames = [
        'oi_heatmap', 'pcr_chart', 'volume_spikes', 'oi_distribution',
        'volatility_skew', 'max_pain', 'oi_change', 'volatility_surface'
      ]
      for (let i = 0; i < plotDivs.length; i++) {
        await (window as any).Plotly.downloadImage(plotDivs[i], {
          format: 'png',
          filename: `skew_${chartNames[i] ?? `chart_${i + 1}`}`,
          width: 1400,
          height: 700,
        })
        await new Promise(r => setTimeout(r, 400))
      }
    } catch (e) {
      console.error('Chart download error:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAllCharts}
            disabled={downloading}
            className="bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full px-4 py-1.5 text-xs font-heading font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {downloading ? <RefreshCw size={12} className="animate-spin" /> : <ImageDown size={12} />}
            Download Charts
          </button>
          <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            Market Bias: Bullish
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="PCR Value" value="1.24" subtitle="Slightly bullish" color="purple" />
        <StatCard title="Total Anomalies" value="12" subtitle="In last 24h" color="red" />
        <StatCard title="Max Pain Strike" value="₹22,000" subtitle="Nearest expiry" color="blue" />
        <StatCard title="Market Bias" value="Bullish" subtitle="Trend alignment" color="green" />
      </div>

      <div className="space-y-6">
        <div className="w-full h-[350px]">
          <OIHeatmap className="h-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
          <div className="lg:col-span-2 h-full">
            <PCRChart className="h-full" />
          </div>
          <div className="lg:col-span-1 h-full">
            <PCRInterpretation className="h-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
          <div className="h-full"><VolumeSpikes className="h-full" /></div>
          <div className="h-full"><OIDistribution className="h-full" /></div>
        </div>

        <div className="w-full h-[350px]">
          <VolatilitySkew className="h-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
          <div className="h-full"><MaxPain className="h-full" /></div>
          <div className="h-full"><OIChange className="h-full" /></div>
        </div>

        <div className="w-full h-[400px]">
          <VolatilitySurface className="h-full" />
        </div>
      </div>

      <div className="mt-12 border-t border-[#1e1e2e] pt-8">
        <StepNav steps={[
          { label: "NLQ Query Data", href: "/query", primary: false },
          { label: "View Insights →", href: "/insights", primary: true }
        ]} />
      </div>
    </div>
  )
}
