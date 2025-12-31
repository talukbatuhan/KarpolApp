"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { updateUserRole } from "@/app/(dashboard)/settings/actions"
import { toast } from "sonner"
import { UserCog } from "lucide-react"

interface Profile {
    id: string
    full_name: string
    email: string
    role: string
}

interface UserManagementProps {
    profiles: Profile[]
    currentUserId: string
}

export function UserManagement({ profiles, currentUserId }: UserManagementProps) {

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateUserRole(userId, newRole)
        if (result.success) {
            toast.success("Role updated")
        } else {
            toast.error(result.message)
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Admin: User Management
                </CardTitle>
                <CardDescription>
                    Manage user roles and permissions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                        <div className="col-span-4">User</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-4">Role</div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {profiles.map(profile => (
                            <div key={profile.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/20 text-sm">
                                <div className="col-span-4 font-medium flex items-center gap-2">
                                    {profile.full_name || 'No Name'}
                                    {profile.id === currentUserId && <Badge variant="secondary" className="text-[10px]">You</Badge>}
                                </div>
                                <div className="col-span-4 text-muted-foreground truncate" title={profile.email}>
                                    {profile.email}
                                </div>
                                <div className="col-span-4">
                                    <Select
                                        defaultValue={profile.role}
                                        onValueChange={(val) => handleRoleChange(profile.id, val)}
                                        disabled={profile.id === currentUserId}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
