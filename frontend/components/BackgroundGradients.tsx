import React from 'react'

export default function BackgroundGradients() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-[#fcfaf9] via-[#fff5f2] to-[#f4f2ff]">
            {/* 
        This acts as the dominant background for the entire application.
        The Enblox reference uses massive, highly visible color blocks.
        We achieve this by making the blurs fill the viewport fully.
      */}

            {/* Massive Left/Top Center: Vibrant Magenta/Pink */}
            <div
                className="absolute w-[1200px] h-[1200px] rounded-full blur-[140px] opacity-[0.45] mix-blend-multiply"
                style={{
                    background: 'radial-gradient(circle, rgba(255,117,195,1) 0%, rgba(255,117,195,0.2) 60%, rgba(255,117,195,0) 80%)',
                    top: '-10%',
                    left: '-20%',
                }}
            />

            {/* Massive Right: Deep Indigo/Purple */}
            <div
                className="absolute w-[1400px] h-[1400px] rounded-full blur-[180px] opacity-[0.35] mix-blend-multiply"
                style={{
                    background: 'radial-gradient(circle, rgba(107,76,248,1) 0%, rgba(107,76,248,0.2) 50%, rgba(107,76,248,0) 80%)',
                    top: '20%',
                    right: '-30%',
                }}
            />

            {/* Massive Bottom/Center: Warm Amber/Peach to kill the 'too white' look */}
            <div
                className="absolute w-[1800px] h-[1000px] rounded-[100%] blur-[160px] opacity-[0.4] mix-blend-multiply"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(255,178,112,1) 0%, rgba(255,178,112,0.3) 50%, rgba(255,178,112,0) 80%)',
                    bottom: '-30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            />
        </div>
    )
}
