import { createClient } from "@/lib/supabase/server"
import { TablesView } from "@/components/tables/tables-view"

export default async function TablesPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    let userPermissions = {}
    let userRole = 'user'

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, permissions')
            .eq('id', user.id)
            .single()

        userPermissions = (profile as any)?.permissions || {}
        userRole = (profile as any)?.role || 'user'
    }

    const { data: tables, error } = await supabase
        .from('dynamic_tables')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching tables:", error)
        return <div>Error loading tables</div>
    }

    return <TablesView tables={tables} userPermissions={userPermissions} userRole={userRole} />
}
