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
      .then(res => {
        console.log('oi distribution:', res.strikes?.length, 'strikes')
        setData({
          strikes: res.strikes,
          ceOI: res.oi_ce,
          peOI: res.oi_pe
        })
      })
      .catch(e => {
        console.error('oi distribution error:', e)
        setData({ strikes: [], ceOI: [], peOI: [] })
      })
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
          bargap: 0.2,
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 50, r: 20, t: 30, b: 50 },
          autosize: true,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af', title: 'Strike' },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#9ca3af' },
          legend: { orientation: 'h', y: -0.25, font: { color: '#6b7280', size: 10 } }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
