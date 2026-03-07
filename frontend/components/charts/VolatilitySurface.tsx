'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getVolatilitySurface } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function VolatilitySurface({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getVolatilitySurface()
      .then(res => setData({ z: res.surface, x: res.strikes, y: res.expiries }))
      .catch(() => setData({ z: [[0]], x: [], y: [] }))
  }, [])

  if (!data) return <ChartCard title="Volatility Surface" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard title="Volatility Surface" className={className}>
      <Plot
        data={[{
          z: data.z,
          x: data.x,
          y: data.y,
          type: 'surface',
          colorscale: 'Portland',
          showscale: false
        }]}
        layout={{
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 9 },
          margin: { l: 0, r: 0, t: 0, b: 0 },
          autosize: true,
          scene: {
            xaxis: { gridcolor: '#e2e8f0', backgroundcolor: 'transparent', showbackground: false, zerolinecolor: '#cbd5e1' },
            yaxis: { gridcolor: '#e2e8f0', backgroundcolor: 'transparent', showbackground: false, zerolinecolor: '#cbd5e1' },
            zaxis: { gridcolor: '#e2e8f0', backgroundcolor: 'transparent', showbackground: false, zerolinecolor: '#cbd5e1' },
            camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '400px' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
