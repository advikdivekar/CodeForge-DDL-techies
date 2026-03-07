'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getOIDistribution } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function OIDistribution({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getOIDistribution()
      .then(res => setData({
        strikes: res.strikes,
        ceOI: res.oi_ce,
        peOI: res.oi_pe
      }))
      .catch(() => setData({ strikes: [], ceOI: [], peOI: [] }))
  }, [])

  if (!data) return <ChartCard title="OI Distribution by Strike" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="OI Distribution by Strike" className={className}>
      <Plot
        data={[
          { x: data.strikes, y: data.ceOI, type: 'bar', name: 'CE OI', marker: { color: '#f59e0b' } },
          { x: data.strikes, y: data.peOI, type: 'bar', name: 'PE OI', marker: { color: '#3b82f6' } }
        ]}
        layout={{
          barmode: 'group',
          bargap: 0.15,
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, type: 'category' },
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
