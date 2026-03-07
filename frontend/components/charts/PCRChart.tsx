'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getPCRData } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function PCRChart({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getPCRData()
      .then(res => setData({ x: res.timestamps, y: res.pcr_values }))
      .catch(() => setData({ x: [], y: [] }))
  }, [])

  if (!data) return <ChartCard title="Put-Call Ratio" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="Put-Call Ratio" className={className}>
      <Plot
        data={[{
          x: data.x,
          y: data.y,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#4338ca', size: 6, line: { color: '#ffffff', width: 1.5 } },
          line: { color: '#4338ca', width: 2, shape: 'spline' }
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false },
          shapes: [
            { type: 'line', y0: 1.2, y1: 1.2, x0: 0, x1: 1, xref: 'paper', line: { color: '#10b981', width: 1.5, dash: 'dot' } },
            { type: 'line', y0: 0.8, y1: 0.8, x0: 0, x1: 1, xref: 'paper', line: { color: '#e11d48', width: 1.5, dash: 'dot' } }
          ]
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
