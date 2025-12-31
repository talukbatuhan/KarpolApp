"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateUserRole } from "@/app/(dashboard)/settings/actions"
import { updateUserPermissions } from "@/app/(dashboard)/tables/actions"
import { toast } from "sonner"
import { UserCog, Shield } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Profile {
    id: string
    full_name: string
    email: string
    role: string
    permissions?: {
        can_create_tables?: boolean
        can_edit_tables?: boolean
        can_delete_tables?: boolean
        can_view_audit_logs?: boolean
        can_manage_users?: boolean
    }
}

interface UserManagementProps {
    profiles: Profile[]
    currentUserId: string
}

export function UserManagement({ profiles, currentUserId }: UserManagementProps) {
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateUserRole(userId, newRole)
        if (result.success) {
            toast.success("Rol güncellendi")
        } else {
            toast.error(result.message)
        }
    }

    const openPermissionsDialog = (profile: Profile) => {
        setSelectedUser(profile)
        setPermissions({
            can_create_tables: profile.permissions?.can_create_tables ?? false,
            can_edit_tables: profile.permissions?.can_edit_tables ?? false,
            can_delete_tables: profile.permissions?.can_delete_tables ?? false,
            can_view_audit_logs: profile.permissions?.can_view_audit_logs ?? false,
            can_manage_users: profile.permissions?.can_manage_users ?? false,
        })
    }

    const handleSavePermissions = async () => {
        if (!selectedUser) return

        const result = await updateUserPermissions(selectedUser.id, permissions)
        if (result.success) {
            toast.success("Yetkiler güncellendi")
            setSelectedUser(null)
        } else {
            toast.error(result.message)
        }
    }

    const permissionLabels = {
        can_create_tables: "Tablo Oluşturma",
        can_edit_tables: "Tablo Düzenleme",
        can_delete_tables: "Tablo Silme",
        can_view_audit_logs: "Denetim Kayıtlarını Görüntüleme",
        can_manage_users: "Kullanıcı Yönetimi",
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Admin: Kullanıcı Yönetimi
                </CardTitle>
                <CardDescription>
                    Kullanıcı rollerini ve yetkilerini yönetin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                        <div className="col-span-3">Kullanıcı</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Rol</div>
                        <div className="col-span-3 text-center">Yetkiler</div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {profiles.map(profile => (
                            <div key={profile.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/20 text-sm">
                                <div className="col-span-3 font-medium flex items-center gap-2">
                                    {profile.full_name || 'İsimsiz'}
                                    {profile.id === currentUserId && <Badge variant="secondary" className="text-[10px]">Siz</Badge>}
                                </div>
                                <div className="col-span-4 text-muted-foreground truncate" title={profile.email}>
                                    {profile.email}
                                </div>
                                <div className="col-span-2">
                                    <Select
                                        defaultValue={profile.role}
                                        onValueChange={(val) => handleRoleChange(profile.id, val)}
                                        disabled={profile.id === currentUserId}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Kullanıcı</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Yönetici</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3 flex justify-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openPermissionsDialog(profile)}
                                                disabled={profile.id === currentUserId || profile.role === 'admin'}
                                            >
                                                <Shield className="h-4 w-4 mr-1" />
                                                Yetkileri Düzenle
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Kullanıcı Yetkileri</DialogTitle>
                                                <DialogDescription>
                                                    {selectedUser?.full_name || selectedUser?.email} için yetkileri düzenleyin
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                {Object.entries(permissionLabels).map(([key, label]) => (
                                                    <div key={key} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={key}
                                                            checked={permissions[key] ?? false}
                                                            onCheckedChange={(checked) =>
                                                                setPermissions(prev => ({ ...prev, [key]: checked as boolean }))
                                                            }
                                                        />
                                                        <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                                                            {label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <DialogTrigger asChild>
                                                    <Button variant="outline">İptal</Button>
                                                </DialogTrigger>
                                                <Button onClick={handleSavePermissions}>
                                                    Kaydet
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
