'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getVolatilitySkew } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function VolatilitySkew({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getVolatilitySkew()
      .then(res => setData({
        strikes: res.strikes,
        expiries: res.expiries.map(exp => ({ date: exp, ivs: res.lines[exp] || [] }))
      }))
      .catch(() => setData({ strikes: [], expiries: [] }))
  }, [])

  if (!data) return <ChartCard title="Volatility Skew" className={className}><LoadingSpinner /></ChartCard>

  const colors = ['#4f46e5', '#059669', '#ea580c']
  const traces = (data.expiries || []).map((exp: any, i: number) => ({
    x: data.strikes,
    y: exp.ivs,
    type: 'scatter',
    mode: 'lines+markers',
    name: exp.date,
    line: { color: colors[i % colors.length], width: 1.5, shape: 'spline' },
    marker: { color: colors[i % colors.length], size: 5 }
  }))

  return (
    <ChartCard title="Volatility Skew" className={className}>
      <Plot
        data={traces}
        layout={{
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false },
          legend: { orientation: 'h', y: -0.2, font: { color: '#64748b' } }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
