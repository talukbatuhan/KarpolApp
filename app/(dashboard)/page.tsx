import { createClient } from "@/lib/supabase/server"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
    const supabase = createClient()

    // Parallel data fetching for performance
    const [
        { count: tablesCount },
        { count: tasksCount },
        { count: completedTasksCount },
        { data: recentAuditLogs },
        { data: allTasks }
    ] = await Promise.all([
        supabase.from('dynamic_tables').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'done'),
        supabase.from('audit_logs').select('*').order('performed_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('status').eq('is_deleted', false)
    ])

    // Calculate task status distribution
    const taskStatusStats = (allTasks || []).reduce((acc: any, task: any) => {
        const status = task.status || 'pending'
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    return (
        <DashboardView
            tablesCount={tablesCount || 0}
            tasksCount={tasksCount || 0}
            completedTasksCount={completedTasksCount || 0}
            recentAuditLogs={recentAuditLogs || []}
            taskStatusStats={taskStatusStats}
        />
    )
}

