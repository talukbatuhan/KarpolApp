"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShieldAlert } from "lucide-react"

interface PermissionAlertProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    permissionName: string
    actionDescription?: string
}

export function PermissionAlert({
    open,
    onOpenChange,
    permissionName,
    actionDescription = "Bu işlemi gerçekleştirmek"
}: PermissionAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <ShieldAlert className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-lg">Yetki Gerekli</AlertDialogTitle>
                        </div>
                    </div>
                    <AlertDialogDescription className="text-base pt-2">
                        {actionDescription} için <span className="font-semibold text-foreground">"{permissionName}"</span> yetkisine ihtiyacınız var.
                        <br /><br />
                        Lütfen sistem yöneticinizle iletişime geçerek gerekli yetkilerin size atanmasını talep edin.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction className="bg-primary">
                        Anladım
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
