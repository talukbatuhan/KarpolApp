"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UseRealtimeProps {
    tableId: string
    onUpdate?: () => void
}

export function useRealtimeTable({ tableId, onUpdate }: UseRealtimeProps) {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel('table_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'table_rows',
                    filter: `table_id=eq.${tableId}`,
                },
                (payload) => {
                    if (onUpdate) {
                        onUpdate()
                    } else {
                        router.refresh()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [tableId, supabase, router, onUpdate])
}
