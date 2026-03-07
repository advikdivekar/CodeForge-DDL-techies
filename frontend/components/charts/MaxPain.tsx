'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getMaxPain } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function MaxPain({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getMaxPain()
      .then(res => setData({
        strikes: res.strikes,
        painValue: res.pain_values,
        maxPainStrike: res.max_pain_strike
      }))
      .catch(() => setData({ strikes: [], painValue: [], maxPainStrike: 0 }))
  }, [])

  if (!data) return <ChartCard title="Max Pain Analysis" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="Max Pain Analysis" className={className}>
      <Plot
        data={[{
          x: data.strikes,
          y: data.painValue,
          type: 'bar',
          marker: { color: '#3b82f6', line: { color: 'transparent', width: 0 } },
          width: 0.6
        }]}
        layout={{
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, type: 'category' },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false },
          shapes: [
            { type: 'line', x0: data.maxPainStrike, x1: data.maxPainStrike, y0: 0, y1: 1, yref: 'paper', line: { color: '#e11d48', width: 1.5, dash: 'dot' } }
          ],
          annotations: [
            { x: data.maxPainStrike, y: 1, yref: 'paper', text: `MAX PAIN ₹${data.maxPainStrike}`, showarrow: false, font: { color: '#e11d48', size: 9 }, yanchor: 'bottom' }
          ]
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
