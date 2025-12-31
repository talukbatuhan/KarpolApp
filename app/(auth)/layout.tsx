import type { Metadata } from 'next'

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
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="relative w-full max-w-md space-y-8 z-10">
                {children}
            </div>
        </div>
    )
}
