import { createClient } from "@/lib/supabase/server"
import { LanguageProvider } from "@/components/providers/language-provider"
import { DashboardContent } from "@/components/layout/dashboard-layout-client"

import { Toaster } from "@/components/ui/sonner"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = null

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        role = profile?.role || null
    }

    return (
        <LanguageProvider>
            <DashboardContent role={role}>
                {children}
            </DashboardContent>
            <Toaster />
        </LanguageProvider>
    )
}
