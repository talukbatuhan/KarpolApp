"use client"

import { useEffect, useState } from "react"
import { Bell, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    created_at: string
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient() as any

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications' as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data as Notification[])
            setUnreadCount((data as Notification[]).filter(n => !n.read).length)
        }
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications' as any)
            .update({ read: true })
            .eq('id', id)

        if (error) {
            toast.error("Bildirim güncellenemedi")
            return
        }

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications' as any)
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (error) {
            toast.error("İşlem başarısız")
            return
        }

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    useEffect(() => {
        fetchNotifications()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload: any) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                    toast.info(newNotification.title, {
                        description: newNotification.message
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-xl border-border/50">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 text-xs text-muted-foreground hover:text-primary">
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-primary/5",
                                        !notification.read && "bg-muted/30"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex w-full items-start justify-between gap-2">
                                        <span className={cn("font-medium text-sm", !notification.read && "text-primary")}>
                                            {notification.title}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
