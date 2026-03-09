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
      .then(res => {
        console.log('pcr data:', res.timestamps?.length, 'points')
        setData({ x: res.timestamps, y: res.pcr_values })
      })
      .catch(e => {
        console.error('pcr error:', e)
        setData({ x: [], y: [] })
      })
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
          fill: 'tozeroy',
          fillcolor: 'rgba(99,102,241,0.12)',
          marker: { color: '#6366f1', size: 5, line: { color: '#ffffff', width: 1 } },
          line: { color: '#6366f1', width: 2.5, shape: 'spline' }
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 50, r: 20, t: 30, b: 50 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af' },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af' },
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
