'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getOIHeatmap } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function OIHeatmap({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getOIHeatmap()
      .then(res => {
        console.log('heatmap data:', res.strikes?.length, 'strikes,', res.timestamps?.length, 'timestamps')
        // z is strikes×timestamps (101×77) — swap so x=timestamps, y=strikes
        setData({ z: res.values, x: res.timestamps, y: res.strikes })
      })
      .catch(e => {
        console.error('heatmap error:', e)
        setData({ z: [[0]], x: [], y: [] })
      })
  }, [])

  if (!data) return <ChartCard title="Open Interest Heatmap" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="Open Interest Heatmap" className={className}>
      <Plot
        data={[{
          z: data.z,
          x: data.x,
          y: data.y,
          type: 'heatmap',
          colorscale: 'Plasma',
          showscale: true,
          colorbar: { thickness: 12, len: 0.8, tickfont: { color: '#9ca3af', size: 9 } }
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 60, r: 60, t: 10, b: 50 },
          autosize: true,
          xaxis: { showgrid: false, zeroline: false, color: '#9ca3af', title: 'Time' },
          yaxis: { showgrid: false, zeroline: false, color: '#9ca3af', title: 'Strike' }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
