import { createClient } from "@/lib/supabase/server"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
    const supabase = createClient()

    // Parallel data fetching for performance
    const [
        { count: tablesCount },
        { count: tasksCount },
        { count: completedTasksCount },
        { data: recentAuditLogs }
    ] = await Promise.all([
        supabase.from('dynamic_tables').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'done'),
        supabase.from('audit_logs').select('*').order('performed_at', { ascending: false }).limit(5)
    ])

    return (
        <DashboardView
            tablesCount={tablesCount || 0}
            tasksCount={tasksCount || 0}
            completedTasksCount={completedTasksCount || 0}
            recentAuditLogs={recentAuditLogs || []}
        />
    )
}

