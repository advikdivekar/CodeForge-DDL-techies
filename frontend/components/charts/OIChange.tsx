'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getOIChange } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function OIChange({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getOIChange()
      .then(res => setData({
        strikes: res.strikes,
        ceChange: res.ce_change,
        peChange: res.pe_change
      }))
      .catch(() => setData({ strikes: [], ceChange: [], peChange: [] }))
  }, [])

  if (!data) return <ChartCard title="OI Change — Buildup vs Unwinding" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="OI Change — Buildup vs Unwinding" className={className}>
      <Plot
        data={[
          { x: data.strikes, y: data.ceChange, type: 'bar', name: 'CE Change', marker: { color: '#10b981' } },
          { x: data.strikes, y: data.peChange, type: 'bar', name: 'PE Change', marker: { color: '#8b5cf6' } }
        ]}
        layout={{
          barmode: 'group',
          bargap: 0.15,
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, type: 'category' },
          yaxis: { gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1', zerolinewidth: 1 },
          legend: { orientation: 'h', y: -0.2, font: { color: '#64748b' } }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
