"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User as UserIcon, Mail, Shield } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { updateProfile, updatePassword } from "@/app/(dashboard)/settings/actions"
import { toast } from "sonner"
import { Lock } from "lucide-react"

interface SettingsViewProps {
    user: any
    profile: any
}

export function SettingsView({ user, profile }: SettingsViewProps) {
    const { t } = useLanguage()

    async function profileAction(formData: FormData) {
        const res = await updateProfile(null, formData)
        if (res?.message === "Profile updated" || res?.message === "Profile updated successfully") {
            toast.success(res.message)
        } else {
            toast.error(res?.message || "Error")
        }
    }

    async function passwordAction(formData: FormData) {
        const res = await updatePassword(null, formData)
        if (res?.message === "Password updated successfully") {
            toast.success(res.message)
            const form = document.getElementById("password-form") as HTMLFormElement
            form?.reset()
        } else if (res?.errors) {
            toast.error("Invalid input", { description: Object.values(res.errors).flat().join(", ") })
        } else {
            toast.error(res?.message || "Error")
        }
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('settings')}</h2>
                <p className="text-muted-foreground">
                    {t('settings_desc')}
                </p>
            </div>

            {/* Profile Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('profile_info')}</CardTitle>
                    <CardDescription>
                        {t('update_details')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={profileAction} className="space-y-4">
                        {/* ... fields ... */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" value={user.email} disabled className="pl-9 bg-muted" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">{t('role')}</Label>
                            <div className="relative">
                                <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="role" value={profile?.role || 'User'} disabled className="pl-9 bg-muted capitalize" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">{t('full_name')}</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={profile?.full_name || ''}
                                    className="pl-9"
                                    placeholder={t('enter_name')}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">{t('save_changes')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Change your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="password-form" action={passwordAction} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className="pl-9"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    className="pl-9"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="outline">Update Password</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
