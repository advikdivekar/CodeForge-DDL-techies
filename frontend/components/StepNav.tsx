import Link from 'next/link'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Step {
  label: string
  href: string
  primary?: boolean
}

interface StepNavProps {
  steps: Step[]
  className?: string
}

export default function StepNav({ steps, className }: StepNavProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 mt-8", className)}>
      {steps.map((step, index) => (
        <Link
          key={index}
          href={step.href}
          className={cn(
            "text-sm font-heading font-bold tracking-wide inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50",
            step.primary
              ? "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-3.5 shadow-md shadow-indigo-500/20"
              : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full px-8 py-3.5 shadow-sm"
          )}
        >
          {step.label}
        </Link>
      ))}
    </div>
  )
}
