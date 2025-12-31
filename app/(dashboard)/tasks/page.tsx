import { createClient } from "@/lib/supabase/server"
import { TasksBoard } from "@/components/tasks/tasks-board"

export default async function TasksPage() {
    const supabase = createClient()

    // Fetch tasks
    const { data: rawTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    const tasks = rawTasks as any[] | null

    return (
        <TasksBoard tasks={tasks || []} />
    )
}
