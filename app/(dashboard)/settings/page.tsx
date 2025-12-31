import { createClient } from "@/lib/supabase/server"
import { SettingsView } from "@/components/settings/settings-view"
import { UserManagement } from "@/components/settings/user-management"

export default async function SettingsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Unauthorized</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    let allProfiles: any[] = []

    // Cast profile to any to avoid TS errors with supabase types for now
    const currentProfile = profile as any

    if (currentProfile?.role === 'admin') {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
        allProfiles = data || []
    }

    return (
        <div className="space-y-6">
            <SettingsView user={user} profile={profile} />
            {currentProfile?.role === 'admin' && (
                <UserManagement profiles={allProfiles} currentUserId={user.id} />
            )}
        </div>
    )
}
