import React from 'react'

interface SkewLogoProps {
    size?: number
    className?: string
}

export default function SkewLogo({ size = 32, className = '' }: SkewLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="skewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" /> {/* purple-400 */}
                    <stop offset="100%" stopColor="#4f46e5" /> {/* indigo-600 */}
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Abstract geometric 'S' taking inspiration from volatility skew charts */}
            <g filter="url(#glow)">
                <path
                    d="M 75 25 
             C 50 25, 30 35, 30 50
             C 30 65, 50 75, 25 75"
                    stroke="url(#skewGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 65 50
             C 65 40, 50 25, 80 25"
                    stroke="#4f46e5"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />
            </g>

            {/* Decorative accent dot representing an options contract */}
            <circle cx="75" cy="75" r="8" fill="#f43f5e" /> {/* rose-500 */}
        </svg>
    )
}
