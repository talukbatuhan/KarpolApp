"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/components/providers/language-provider"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Share2, Trash2, UserPlus, Shield } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TablePermissionsProps {
    tableId: string
    ownerId: string | null
}

export function TablePermissions({ tableId, ownerId }: TablePermissionsProps) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [permissions, setPermissions] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [selectedRole, setSelectedRole] = useState<string>("viewer")
    const [currentUser, setCurrentUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)
        }
        checkUser()
    }, [])

    useEffect(() => {
        if (open) {
            fetchPermissions()
            fetchUsers()
        }
    }, [open])

    const fetchPermissions = async () => {
        const { data, error } = await supabase
            .from('table_permissions')
            .select('*, user:profiles!user_id(id, full_name, email, avatar_url)')
            .eq('table_id', tableId)

        if (data) setPermissions(data)
    }

    const fetchUsers = async () => {
        // Only fetch users not already having permission + not self
        const { data } = await supabase.from('profiles').select('id, full_name, email')
        if (data) {
            setUsers(data)
        }
    }

    const handleAddPermission = async () => {
        if (!selectedUser) return

        const { error } = await supabase
            .from('table_permissions')
            .insert({
                table_id: tableId,
                user_id: selectedUser,
                role: selectedRole
            } as any)
            .select()

        if (error) {
            console.error("Permission error:", error)
            toast.error("Error adding permission", { description: error.message })
        } else {
            toast.success("Permission added")
            setSelectedUser("")
            fetchPermissions()
        }
    }

    const handleRemovePermission = async (id: string) => {
        const { error } = await supabase
            .from('table_permissions')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error("Error removing", { description: error.message })
        } else {
            toast.success("Removed")
            setPermissions(prev => prev.filter(p => p.id !== id))
        }
    }

    // Check if current user is owner or admin to show management UI
    // Ideally this check is also done on server/RLS, but for UI hiding:
    // We assume if they can see the button (from parent), they might have access, or we check here.
    // Let's assume parent controls visibility generally, but we can double check.

    const availableUsers = users.filter(u =>
        u.id !== ownerId && // Not owner
        !permissions.find(p => p.user_id === u.id) // Not already added
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    {t('share_table')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{t('manage_access')}</DialogTitle>
                    <DialogDescription>
                        {t('share_table')} with other users.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-end gap-2">
                        <div className="grid gap-2 flex-1">
                            <Label>{t('add_user')}</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('search_users')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 w-[120px]">
                            <Label>{t('role')}</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">{t('viewer')}</SelectItem>
                                    <SelectItem value="editor">{t('editor')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddPermission} disabled={!selectedUser}>
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="border rounded-md mt-4">
                        <div className="p-2 border-b bg-muted/50 text-xs font-semibold text-muted-foreground flex justify-between">
                            <span>User</span>
                            <span>Role</span>
                        </div>
                        <ScrollArea className="h-[200px] p-2">
                            {/* Owner (Static) */}
                            {users.find(u => u.id === ownerId) && (
                                <div className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-yellow-500" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Owner</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Owner</span>
                                </div>
                            )}

                            {permissions.map(perm => (
                                <div key={perm.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={perm.user?.avatar_url} />
                                            <AvatarFallback>{perm.user?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{perm.user?.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{perm.user?.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs border px-2 py-1 rounded capitalize">{t(perm.role)}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemovePermission(perm.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {permissions.length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No explicit permissions granted.
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
