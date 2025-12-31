'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteTable(tableId: string) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Giriş yapılmamış" }

    // Check if user has permission to delete tables
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error("Error fetching profile:", profileError)
        return { success: false, message: "Profil bilgisi alınamadı: " + profileError.message }
    }

    const hasPermission = (profile as any)?.role === 'admin' ||
        (profile as any)?.permissions?.can_delete_tables === true

    if (!hasPermission) {
        return { success: false, message: "Tablo silme yetkiniz yok" }
    }

    console.log('Attempting to delete table:', tableId, 'User:', user.id, 'Role:', (profile as any)?.role)

    try {
        // WORKAROUND: Manually create audit log with table_id = null
        // This prevents the trigger from causing foreign key issues
        await supabase.from('audit_logs').insert({
            entity_type: 'dynamic_tables',
            entity_id: tableId,
            table_id: null, // CRITICAL: Set to null since table is being deleted
            action: 'DELETE',
            performed_by: user.id,
            old_data: null,
            new_data: null
        })

        // Delete the table (will cascade to table_rows)
        const { error } = await supabase
            .from('dynamic_tables')
            .delete()
            .eq('id', tableId)

        if (error) {
            console.error("Error deleting table:", error)
            return {
                success: false,
                message: `Tablo silinemedi: ${error.message || error.details || 'Bilinmeyen hata'}`,
                errorDetails: error
            }
        }

        revalidatePath('/tables')
        return { success: true, message: "Tablo başarıyla silindi" }
    } catch (error: any) {
        console.error("Exception deleting table:", error)
        return {
            success: false,
            message: `Tablo silinemedi: ${error.message || 'Beklenmeyen hata'}`
        }
    }
}

export async function updateUserPermissions(userId: string, permissions: Record<string, boolean>) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Unauthorized" }

    // Only admins can update permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if ((profile as any)?.role !== 'admin') {
        return { success: false, message: "Only admins can manage permissions" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ permissions })
        .eq('id', userId)

    if (error) {
        console.error("Error updating permissions:", error)
        return { success: false, message: "Failed to update permissions" }
    }

    revalidatePath('/settings')
    return { success: true, message: "Permissions updated successfully" }
}
