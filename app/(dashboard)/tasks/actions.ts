'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createTaskSchema = z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().optional(),
    assigned_department: z.string().min(1, "Department required"),
    due_date: z.string().optional(),
})

export async function createTask(prevState: any, formData: FormData) {
    const supabase = createClient() as any

    const validatedFields = createTaskSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        assigned_department: formData.get('assigned_department'),
        due_date: formData.get('due_date') || undefined,
    })

    if (!validatedFields.success) {
        return { message: "Validation Error", errors: validatedFields.error.flatten().fieldErrors }
    }

    const { title, description, assigned_department, due_date } = validatedFields.data

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: "Unauthorized" }
    }

    const { error } = await supabase
        .from('tasks')
        .insert({
            title,
            description,
            // assigned_department, // TODO: Uncomment when migration is applied
            due_date,
            status: 'todo',
            is_deleted: false,
            created_by: user.id
        } as any)

    if (error) {
        console.error("Create task error", error)
        return { message: "Failed to create task: " + error.message }
    }

    revalidatePath('/tasks')
    return { message: "Task created" }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const supabase = createClient() as any
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'

    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus } as any)
        .eq('id', taskId)

    if (error) {
        return { success: false }
    }

    revalidatePath('/tasks')
    revalidatePath('/') // update dashboard stats too
    return { success: true }
}

export async function deleteTask(taskId: string) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('tasks')
    revalidatePath('/tasks')
    return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('tasks')
        .update({ status } as any)
        .eq('id', taskId)

    if (error) return { success: false }

    revalidatePath('/tasks')
    revalidatePath('/')
    return { success: true }
}
