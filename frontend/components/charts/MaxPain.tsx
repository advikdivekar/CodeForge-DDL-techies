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
      .then(res => {
        console.log('max pain:', res.max_pain_strike, 'strikes:', res.strikes?.length)
        setData({
          strikes: res.strikes,
          painValue: res.pain_values,
          maxPainStrike: res.max_pain_strike
        })
      })
      .catch(e => {
        console.error('max pain error:', e)
        setData({ strikes: [], painValue: [], maxPainStrike: 0 })
      })
  }, [])

  if (!data) return <ChartCard title="Max Pain Analysis" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="Max Pain Analysis" className={className}>
      <Plot
        data={[{
          x: data.strikes,
          y: data.painValue,
          type: 'bar',
          marker: { color: data.strikes?.map((s: number) => s === data.maxPainStrike ? '#e11d48' : '#6366f1'), line: { color: 'transparent', width: 0 } }
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 50, r: 20, t: 30, b: 50 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af', title: 'Strike' },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af', title: 'Pain Value' },
          shapes: [
            { type: 'line', x0: data.maxPainStrike, x1: data.maxPainStrike, y0: 0, y1: 1, yref: 'paper', line: { color: '#e11d48', width: 2, dash: 'dot' } }
          ],
          annotations: [
            { x: data.maxPainStrike, y: 1, yref: 'paper', text: `MAX PAIN ₹${data.maxPainStrike?.toLocaleString('en-IN')}`, showarrow: false, font: { color: '#e11d48', size: 10 }, yanchor: 'bottom' }
          ]
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
