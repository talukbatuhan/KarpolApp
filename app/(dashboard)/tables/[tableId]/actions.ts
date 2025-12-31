'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Types ---
type ColumnSchema = {
    id: string
    name: string
    type: 'text' | 'number' | 'date' | 'select'
    options?: string[] // for select type
}

// --- Schema Management ---

export async function updateTableSchema(tableId: string, newSchema: ColumnSchema[]) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('dynamic_tables')
        .update({ columns_schema: newSchema } as any)
        .eq('id', tableId)

    if (error) {
        console.error("Error updating schema:", error)
        return { success: false, message: "Failed to update columns." }
    }

    revalidatePath(`/tables/${tableId}`)
    return { success: true, message: "Columns updated successfully." }
}

// --- Row Management ---

export async function addRow(tableId: string, rowData: Record<string, any>) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Unauthorized" }

    // Get current max order to append to bottom
    const { data: maxOrderData } = await supabase
        .from('table_rows')
        .select('row_order')
        .eq('table_id', tableId)
        .order('row_order', { ascending: false })
        .limit(1)
        .single()

    const nextOrder = (maxOrderData?.row_order || 0) + 1

    const { error } = await supabase
        .from('table_rows')
        .insert({
            table_id: tableId,
            data: rowData,
            row_order: nextOrder,
            created_by: user.id
        } as any)

    if (error) {
        console.error("Error adding row:", error)
        return { success: false, message: "Failed to add row." }
    }

    revalidatePath(`/tables/${tableId}`)
    return { success: true, message: "Row added successfully." }
}

export async function importRows(tableId: string, rowsData: Record<string, any>[]) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Unauthorized" }

    // Get current max order
    const { data: maxOrderData } = await supabase
        .from('table_rows')
        .select('row_order')
        .eq('table_id', tableId)
        .order('row_order', { ascending: false })
        .limit(1)
        .single()

    let nextOrder = (maxOrderData?.row_order || 0) + 1

    const rowsToInsert = rowsData.map(data => ({
        table_id: tableId,
        data: data,
        row_order: nextOrder++,
        created_by: user.id
    }))

    const { error } = await supabase
        .from('table_rows')
        .insert(rowsToInsert as any)

    if (error) {
        console.error("Error importing rows:", error)
        return { success: false, message: "Failed to import rows." }
    }

    revalidatePath(`/tables/${tableId}`)
    return { success: true, message: `${rowsData.length} rows imported successfully.` }
}

export async function deleteRow(rowId: string, tableId: string) {
    const supabase = createClient() as any

    // Soft delete
    const { error } = await supabase
        .from('table_rows')
        .update({ is_deleted: true } as any)
        .eq('id', rowId)

    if (error) {
        return { success: false, message: "Failed to delete row." }
    }

    revalidatePath(`/tables/${tableId}`)
    return { success: true, message: "Row deleted." }
}

export async function updateRowData(rowId: string, tableId: string, newData: Record<string, any>) {
    const supabase = createClient() as any

    // We need to merge with existing data usually, but for single cell edits, 
    // we might send the whole object or just the patch. 
    // Let's assume we fetch, merge, and update, or just update the jsonb.
    // Supabase update on JSONB replaces the whole object usually unless using specific jsonb operators.
    // For simplicity in this "MVP+", we will assume generic update.

    const { error } = await supabase
        .from('table_rows')
        .update({ data: newData } as any)
        .eq('id', rowId)

    if (error) {
        return { success: false, message: "Failed to update row." }
    }

    revalidatePath(`/tables/${tableId}`)
    return { success: true }
}
