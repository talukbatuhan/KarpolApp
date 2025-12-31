import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TableEditor } from "@/components/dynamic-table/table-editor"

interface TablePageProps {
    params: {
        tableId: string
    }
}

export default async function TablePage({ params }: TablePageProps) {
    const supabase = createClient()

    // 1. Fetch Table Definition
    const { data: tableDef, error: tableError } = await supabase
        .from('dynamic_tables')
        .select('*')
        .eq('id', params.tableId)
        .single()

    if (tableError || !tableDef) {
        console.error("Error fetching table:", tableError)
        return notFound()
    }

    // 2. Fetch Table Rows
    const { data: rows, error: rowsError } = await supabase
        .from('table_rows')
        .select('*')
        .eq('table_id', params.tableId)
        .eq('is_deleted', false)
        .order('row_order', { ascending: true })

    if (rowsError) {
        console.error("Error fetching rows:", rowsError)
        return <div>Error loading data</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{tableDef.name}</h2>
                <p className="text-muted-foreground">
                    {tableDef.description}
                </p>
            </div>

            <TableEditor tableDefinition={tableDef} initialRows={rows || []} />
        </div>
    )
}
