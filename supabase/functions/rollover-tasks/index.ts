import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
    'Content-Type': 'application/json',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with Service Role Key (required for admin tasks like rollover)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Identify tasks that are overdue and not done
        // Logic: due_date < today AND status != 'done'
        const today = new Date().toISOString().split('T')[0]

        const { data: overdueTasks, error: fetchError } = await supabaseClient
            .from('tasks')
            .select('*')
            .lt('due_date', today)
            .neq('status', 'done')
            .neq('status', 'rolled_over') // Don't rollover already rolled over tasks if we copy them
            .eq('is_deleted', false)

        if (fetchError) throw fetchError

        let rolledOverCount = 0

        // 2. Process each overdue task
        for (const task of overdueTasks || []) {
            // Option A: Update date to today (Move)
            // Option B: Mark as 'rolled_over' and create a NEW task for today (Copy/History preserved)
            // Requirement: "Otomatik olarak ertesi güne aktarılmalı veya 'Devredildi' statüsüyle kopyalanmalı."
            // Let's implement Option B (Copy) as it provides better audit trail.

            // A. Mark old task as 'rolled_over'
            await supabaseClient
                .from('tasks')
                .update({ status: 'rolled_over' })
                .eq('id', task.id)

            // B. Create new task for today
            const { error: insertError } = await supabaseClient
                .from('tasks')
                .insert({
                    title: `[Devreden] ${task.title}`,
                    description: task.description,
                    priority: task.priority,
                    assigned_to: task.assigned_to,
                    created_by: task.created_by,
                    due_date: today, // Set for today
                    status: 'todo'
                })

            if (!insertError) rolledOverCount++
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Rollover complete. Processed ${overdueTasks?.length} tasks. Created ${rolledOverCount} new tasks.`
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
