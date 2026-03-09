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
      .then(res => {
        console.log('vol skew:', res.expiries?.length, 'expiries,', res.strikes?.length, 'strikes')
        setData({
          strikes: res.strikes,
          expiries: res.expiries.map((exp: string) => ({ date: exp, ivs: res.lines[exp] || [] }))
        })
      })
      .catch(e => {
        console.error('vol skew error:', e)
        setData({ strikes: [], expiries: [] })
      })
  }, [])

  if (!data) return <ChartCard title="Volatility Skew" className={className}><LoadingSpinner /></ChartCard>

  const colors = ['#4f46e5', '#059669', '#ea580c']
  const traces = (data.expiries || []).map((exp: any, i: number) => ({
    x: data.strikes,
    y: exp.ivs,
    type: 'scatter',
    mode: 'lines+markers',
    name: exp.date,
    line: { color: colors[i % colors.length], width: 2, shape: 'spline' },
    marker: { color: colors[i % colors.length], size: 5 }
  }))

  return (
    <ChartCard title="Volatility Skew" className={className}>
      <Plot
        data={traces}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 50, r: 20, t: 30, b: 50 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af', title: 'Strike' },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af', title: 'IV Proxy (%)' },
          legend: { orientation: 'h', y: -0.25, font: { color: '#6b7280', size: 10 } }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
