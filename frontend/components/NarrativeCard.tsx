export default function NarrativeCard({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: any }) {
  return (
    <div className="bg-gradient-to-br from-white/70 to-indigo-50/40 backdrop-blur-2xl p-6 rounded-2xl border border-white/60 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)] col-span-1 md:col-span-2 relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)]">
      {/* Decorative corner glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-indigo-900 font-heading font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
        {title}
      </h3>
      {children}
    </div>
  )
}
