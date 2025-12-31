import { createClient } from "@/lib/supabase/server"
import { TablesView } from "@/components/tables/tables-view"

export default async function TablesPage() {
    const supabase = createClient()

    const { data: tables, error } = await supabase
        .from('dynamic_tables')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching tables:", error)
        return <div>Error loading tables</div>
    }

    return <TablesView tables={tables} />
}
