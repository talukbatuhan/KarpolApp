import { createClient, createAdminClient } from "@/lib/supabase/server"
import { AuditLogsView } from "@/components/admin/audit-logs-view"
import { redirect } from "next/navigation"

export default async function AuditLogsPage() {
    const supabase = createClient()

    // Check Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Authorization Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if ((profile as any)?.role !== 'admin') {
        redirect('/')
    }

    // Fetch Logs using Admin Client to bypass RLS if policy not applied
    // This serves as a fallback or main method for internal admin views
    const adminSupabase = createAdminClient()

    // Note: 'performed_by_user' (profiles) join might be tricky if we don't have RLS on profiles for service role? 
    // Service role bypasses ALL RLS.
    // However, the relationship needs to exist.
    // Let's first try fetching logs, then populate users if needed, or query with join.
    // Supabase JS client supports joins even with Service Role.

    const { data: logs, error } = await adminSupabase
        .from('audit_logs')
        .select(`
            *,
            performed_by_user:profiles!performed_by(full_name, email)
        `)
        .order('performed_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching audit logs:", error)
        // Fallback to standard client if admin client fails (e.g. no service key)
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { data: userLogs, error: userError } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    performed_by_user:profiles!performed_by(full_name, email)
                `)
                .order('performed_at', { ascending: false })
                .limit(100)

            if (userError) return <div className="p-8 text-red-500">Error loading logs: {userError.message}</div>
            return <AuditLogsView logs={userLogs || []} />
        }
        return <div className="p-8 text-red-500">Error loading audit logs: {error.message}</div>
    }

    return <AuditLogsView logs={logs || []} />
}
