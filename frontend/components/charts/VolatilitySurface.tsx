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
      .then(res => {
        console.log('vol surface:', res.strikes?.length, 'strikes,', res.expiries?.length, 'expiries, surface rows:', res.surface?.length)
        setData({ z: res.surface, x: res.strikes, y: res.expiries })
      })
      .catch(e => {
        console.error('vol surface error:', e)
        setData({ z: [[0]], x: [], y: [] })
      })
  }, [])

  if (!data || !data.z || data.z.length === 0) {
    return <ChartCard title="Volatility Surface" className={className}><LoadingSpinner /></ChartCard>
  }

  return (
    <ChartCard title="Volatility Surface" className={className}>
      <Plot
        data={[{
          z: data.z,
          x: data.x,
          y: data.y,
          type: 'surface',
          colorscale: 'Jet',
          showscale: true,
          opacity: 0.92,
          colorbar: { thickness: 12, len: 0.7, tickfont: { color: '#9ca3af', size: 9 } },
          contours: {
            z: { show: true, usecolormap: true, highlightcolor: '#ffffff', project: { z: false } }
          }
        }]}
        layout={{
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#6b7280', size: 11 },
          margin: { l: 0, r: 50, t: 10, b: 0 },
          autosize: true,
          scene: {
            bgcolor: 'rgba(248,250,252,0.5)',
            xaxis: { title: 'Strike', color: '#6b7280', gridcolor: '#e2e8f0', backgroundcolor: 'rgba(241,245,249,0.5)', showbackground: true },
            yaxis: { title: 'Expiry', color: '#6b7280', gridcolor: '#e2e8f0', backgroundcolor: 'rgba(241,245,249,0.5)', showbackground: true },
            zaxis: { title: 'IV Proxy', color: '#6b7280', gridcolor: '#e2e8f0', backgroundcolor: 'rgba(241,245,249,0.5)', showbackground: true },
            camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } }
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
