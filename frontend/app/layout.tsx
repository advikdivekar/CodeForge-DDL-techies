import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import TopNav from '@/components/TopNav'
import BackgroundGradients from '@/components/BackgroundGradients'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'Skew - Options Analytics',
  description: 'NIFTY Options Analytics Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${jakarta.variable}`}>
      <body className="bg-[#fcfaf9] text-slate-800 font-sans antialiased selection:bg-indigo-300 relative">
        <BackgroundGradients />
        <div className="flex flex-col min-h-screen">
          <TopNav />
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 pt-32 pb-12 relative z-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
