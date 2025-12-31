"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { PermissionAlert } from "@/components/ui/permission-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { addRow } from "@/app/(dashboard)/tables/[tableId]/actions"
import { toast } from "sonner"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Column {
    id: string
    name: string
    type: string
    options?: string[]
}

interface AddRowDialogProps {
    tableId: string
    schema: Column[]
    userPermissions?: {
        can_edit_tables?: boolean
    }
    userRole?: string
}

export function AddRowDialog({ tableId, schema, userPermissions, userRole }: AddRowDialogProps) {
    const [open, setOpen] = useState(false)
    const [showPermissionAlert, setShowPermissionAlert] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)

    const canEdit = userRole === 'admin' || userPermissions?.can_edit_tables === true

    const handleButtonClick = () => {
        if (!canEdit) {
            setShowPermissionAlert(true)
        } else {
            setOpen(true)
        }
    }

    const handleChange = (colId: string, value: any) => {
        setFormData(prev => ({ ...prev, [colId]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await addRow(tableId, formData)
        setLoading(false)

        if (result.success) {
            toast.success("Satır başarıyla eklendi")
            setOpen(false)
            setFormData({}) // Reset form
        } else {
            toast.error(result.message || "Satır eklenemedi")
        }
    }

    return (
        <>
            <Button onClick={handleButtonClick}>
                <Plus className="mr-2 h-4 w-4" />
                Satır Ekle
            </Button>

            <PermissionAlert
                open={showPermissionAlert}
                onOpenChange={setShowPermissionAlert}
                permissionName="Tablo Düzenleme"
                actionDescription="Satır eklemek"
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yeni Satır Ekle</DialogTitle>
                        <DialogDescription>
                            Yeni satır için değerleri girin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {schema.map((col) => (
                            <div key={col.id} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={col.id} className="text-right">
                                    {col.name}
                                </Label>

                                {col.type === 'select' ? (
                                    <div className="col-span-3">
                                        <Select
                                            value={formData[col.id] || ''}
                                            onValueChange={(val) => handleChange(col.id, val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçiniz..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {col.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                                {(!col.options || col.options.length === 0) && (
                                                    <div className="p-2 text-xs text-muted-foreground">Seçenek yok</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <Input
                                        id={col.id}
                                        className="col-span-3"
                                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                        value={formData[col.id] || ''}
                                        onChange={(e) => handleChange(col.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                        {schema.length === 0 && (
                            <p className="text-center text-muted-foreground">Sütun tanımlı değil. Önce sütun ekleyin.</p>
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={loading || schema.length === 0}>
                                {loading ? "Ekleniyor..." : "Satır Ekle"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
