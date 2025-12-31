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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { addRow } from "@/app/(dashboard)/tables/[tableId]/actions"

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
}

export function AddRowDialog({ tableId, schema }: AddRowDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)

    const handleChange = (colId: string, value: any) => {
        setFormData(prev => ({ ...prev, [colId]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await addRow(tableId, formData)
        setLoading(false)

        if (result.success) {
            setOpen(false)
            setFormData({}) // Reset form
        } else {
            alert("Failed to add row")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Row
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Row</DialogTitle>
                    <DialogDescription>
                        Enter the values for the new row columns.
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
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {col.options?.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                            {(!col.options || col.options.length === 0) && (
                                                <div className="p-2 text-xs text-muted-foreground">No options</div>
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
                        <p className="text-center text-muted-foreground">No columns defined. Add columns first.</p>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={loading || schema.length === 0}>
                            {loading ? "Adding..." : "Add Row"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
