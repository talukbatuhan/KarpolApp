import type { Metadata } from 'next'
import Orb from '@/components/orb' // Orb bileşeninin yolu

export const metadata: Metadata = {
    title: 'Authentication',
    description: 'Login to access the panel',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#0f1419' }}>
            {/* Subtle radial glow behind orb */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-950/30 via-transparent to-transparent z-0"
                style={{
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center center'
                }}
            />

            {/* Orb effect - original settings with hover enabled */}
            <div className="absolute inset-0 z-10">
                <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                    backgroundColor="#0f1419"
                />
            </div>

            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none z-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                }}
            />

            {/* Content - no card wrapper, blends with orb - high z-index for interactivity */}
            <div className="relative w-full max-w-md space-y-8 z-50">
                {children}
            </div>
        </div>
    )
}