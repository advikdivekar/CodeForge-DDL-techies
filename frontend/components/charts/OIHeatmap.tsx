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
      .then(res => setData({ z: res.values, x: res.strikes, y: res.timestamps }))
      .catch(() => setData({ z: [[0]], x: [], y: [] }))
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
          colorscale: [
            [0, '#f8fafc'],
            [0.5, '#a5b4fc'],
            [1, '#4338ca']
          ],
          showscale: false
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          xaxis: { showgrid: false, zeroline: false },
          yaxis: { showgrid: false, zeroline: false }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
