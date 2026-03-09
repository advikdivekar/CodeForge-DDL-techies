import React from 'react'
import ARIAPanel from '@/components/ARIAPanel'

export default function AriaPage() {
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">ARIA — Options Intelligence</h1>
        <p className="text-slate-500 mt-2 font-heading font-medium">Ask ARIA to explain signals, PCR, OI buildup, and market conditions</p>
      </div>

      <div className="flex-1 min-h-0 pb-6">
        <ARIAPanel />
      </div>
    </div>
  )
}
