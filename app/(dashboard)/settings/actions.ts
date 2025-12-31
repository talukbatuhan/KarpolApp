'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ... existing code ...

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    full_name: z.string().min(2, "Name required"),
    role: z.enum(['user', 'admin', 'manager']).default('user')
})

export async function createUser(prevState: any, formData: FormData) {
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) return { message: "Unauthorized" }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
    if ((profile as any)?.role !== 'admin') return { message: "Forbidden" }

    const validatedFields = createUserSchema.safeParse({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string,
    })

    if (!validatedFields.success) {
        return { message: "Validation Error", errors: validatedFields.error.flatten().fieldErrors }
    }

    const { email, password, full_name, role } = validatedFields.data
    const supabaseAdmin = createAdminClient()

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
    })

    if (error) {
        return { message: "Failed to create user: " + error.message }
    }

    if (newUser.user) {
        // Update role immediately (The trigger might have created the profile with 'user' role)
        // We wait a tiny bit or just allow the trigger to finish? Trigger is sync usually in PG for 'after insert'.
        // But to be safe, we just update the profile row.
        const { error: profileError } = await (supabaseAdmin as any)
            .from('profiles')
            .update({ role } as any)
            .eq('id', newUser.user.id)

        if (profileError) console.error("Failed to set role", profileError)
    }

    revalidatePath('/settings')
    return { message: "User created successfully" }
}

const updatePasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export async function updatePassword(prevState: any, formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { message: "Unauthorized" }

    const validatedFields = updatePasswordSchema.safeParse({
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string
    })

    if (!validatedFields.success) {
        return { message: "Validation Error", errors: validatedFields.error.flatten().fieldErrors }
    }

    const { password } = validatedFields.data

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { message: "Failed to update password: " + error.message }
    }

    return { message: "Password updated successfully" }
}

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
})

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = createClient()

    const validatedFields = profileSchema.safeParse({
        full_name: formData.get('full_name') as string,
    })

    if (!validatedFields.success) {
        return { message: "Validation Error", errors: validatedFields.error.flatten().fieldErrors }
    }

    const { full_name } = validatedFields.data

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Unauthorized" }

    const { error } = await (supabase as any)
        .from('profiles')
        .update({ full_name } as any)
        .eq('id', user.id)

    if (error) {
        console.error("Profile update error", error)
        return { message: "Failed to update profile" }
    }

    revalidatePath('/settings')
    return { message: "Profile updated successfully" }
}

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Unauthorized" }

    // Double check admin status on server
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if ((profile as any)?.role !== 'admin') {
        return { success: false, message: "Forbidden" }
    }

    const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole } as any)
        .eq('id', userId)

    if (error) {
        console.error("Update role error", error)
        return { success: false, message: "Failed: " + error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}
