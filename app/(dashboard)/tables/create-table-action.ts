'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const createTableSchema = z.object({
    name: z.string().min(2, {
        message: "Table name must be at least 2 characters.",
    }),
    description: z.string().optional(),
})

export async function createTable(prevState: any, formData: FormData) {
    const supabase = createClient()

    const validatedFields = createTableSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Table.',
        }
    }

    const { name, description } = validatedFields.data

    try {
        const { data: user, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error("Unauthorized")

        const { data, error } = await supabase
            .from('dynamic_tables')
            .insert({
                name,
                description,
                owner_id: user.user.id,
                columns_schema: [] // Start with empty columns
            })
            .select()
            .single()

        if (error) {
            return {
                message: 'Database Error: Failed to Create Table.',
            }
        }

        revalidatePath('/tables')
        return { message: 'Success', tableId: data.id }
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Table.',
        }
    }
}
