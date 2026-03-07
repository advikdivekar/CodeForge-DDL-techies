'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChartCard from '../ChartCard'
import LoadingSpinner from '../LoadingSpinner'
import { getVolumeSpikes } from '@/lib/api'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function VolumeSpikes({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getVolumeSpikes()
      .then(res => {
        const normal = res.data.filter(d => d.anomaly === 0)
        const anomaly = res.data.filter(d => d.anomaly === 1)
        setData({
          normalX: normal.map(d => d.strike),
          normalY: normal.map(d => d.total_volume),
          anomalyX: anomaly.map(d => d.strike),
          anomalyY: anomaly.map(d => d.total_volume),
          count: res.total_anomalies
        })
      })
      .catch(() => setData({ normalX: [], normalY: [], anomalyX: [], anomalyY: [], count: 0 }))
  }, [])

  if (!data) return <ChartCard title="Volume Anomaly Detection" className={className}><LoadingSpinner /></ChartCard>

  return (
    <ChartCard
      title="Volume Anomaly Detection"
      subtitle={data.count > 0 ? `${data.count} anomalies` : ''}
      className={className}
    >
      <Plot
        data={[
          {
            x: data.normalX, y: data.normalY,
            type: 'scatter', mode: 'markers',
            marker: { color: '#94a3b8', size: 5, opacity: 0.6 },
            name: 'Normal'
          },
          {
            x: data.anomalyX, y: data.anomalyY,
            type: 'scatter', mode: 'markers',
            marker: { color: '#e11d48', symbol: 'diamond', size: 10, line: { color: '#ffffff', width: 1.5 } },
            name: 'Anomaly'
          }
        ]}
        layout={{
          paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
          font: { family: 'JetBrains Mono, monospace', color: '#475569', size: 10 },
          margin: { l: 40, r: 10, t: 10, b: 30 },
          autosize: true,
          showlegend: false,
          xaxis: { gridcolor: '#f1f5f9', zeroline: false },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false }
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </ChartCard>
  )
}
