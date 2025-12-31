"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createTable } from "./create-table-action"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PermissionAlert } from "@/components/ui/permission-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Oluşturuluyor..." : "Tablo Oluştur"}
        </Button>
    )
}

interface CreateTableDialogProps {
    userPermissions?: {
        can_create_tables?: boolean
    }
    userRole?: string
}

export function CreateTableDialog({ userPermissions, userRole }: CreateTableDialogProps) {
    const [open, setOpen] = useState(false)
    const [showPermissionAlert, setShowPermissionAlert] = useState(false)
    const [state, setState] = useState<{ message?: string; errors?: any; tableId?: string } | null>(null)
    const router = useRouter()

    const canCreate = userRole === 'admin' || userPermissions?.can_create_tables === true

    const handleButtonClick = () => {
        if (!canCreate) {
            setShowPermissionAlert(true)
        } else {
            setOpen(true)
        }
    }

    async function clientAction(formData: FormData) {
        const result = await createTable(null, formData)
        if (result?.tableId) {
            setOpen(false)
            toast.success("Tablo başarıyla oluşturuldu!")
            router.push(`/tables/${result.tableId}`)
        } else {
            setState(result)
            if (result?.message) {
                toast.error(result.message)
            }
        }
    }

    return (
        <>
            <Button onClick={handleButtonClick}>
                <Plus className="mr-2 h-4 w-4" />
                Tablo Oluştur
            </Button>

            {/* Permission Denied Alert */}
            <PermissionAlert
                open={showPermissionAlert}
                onOpenChange={setShowPermissionAlert}
                permissionName="Tablo Oluşturma"
                actionDescription="Tablo oluşturmak"
            />

            {/* Create Table Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yeni Tablo Oluştur</DialogTitle>
                        <DialogDescription>
                            Tablonuza bir isim verin. Sütunları daha sonra ekleyebilirsiniz.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={clientAction}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    İsim
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue=""
                                    className="col-span-3"
                                    required
                                    placeholder="Ör: Müşteriler, Ürünler..."
                                />
                            </div>
                            {state?.errors?.name && (
                                <p className="text-red-500 text-sm ml-auto col-span-3">{state.errors.name}</p>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Açıklama
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue=""
                                    className="col-span-3"
                                    placeholder="İsteğe bağlı..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <SubmitButton />
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
