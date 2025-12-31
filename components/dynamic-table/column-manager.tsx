"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select" // Note: We need to create select.tsx later if not exists
import { Settings2, Trash2, Plus } from "lucide-react"
import { updateTableSchema } from "@/app/(dashboard)/tables/[tableId]/actions"
import { toast } from "sonner" // Assuming sonner or toast is available, if not we'll use simple alert or console

// We'll standardise the Column Type
interface Column {
    id: string
    name: string
    type: 'text' | 'number' | 'date' | 'select'
}

interface ColumnManagerProps {
    tableId: string
    currentSchema: Column[]
}

// Sub-component for options
function OptionsEditor({ column, onBack, onUpdate }: { column: Column, onBack: () => void, onUpdate: (options: string[]) => void }) {
    const [options, setOptions] = useState<string[]>((column as any).options || [])
    const [newOption, setNewOption] = useState("")

    const addOption = () => {
        if (!newOption.trim()) return
        const updated = [...options, newOption.trim()]
        setOptions(updated)
        onUpdate(updated)
        setNewOption("")
    }

    const removeOption = (index: number) => {
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        onUpdate(updated)
    }

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    &larr; Back
                </Button>
                <div className="text-sm font-medium">Column: {column.name}</div>
            </div>

            <div className="space-y-2">
                {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 border p-2 rounded bg-muted/20">
                        <span className="flex-1 text-sm">{opt}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeOption(i)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="New Option"
                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
                <Button onClick={addOption} size="sm">Add</Button>
            </div>
        </div>
    )
}

export function ColumnManager({ tableId, currentSchema }: ColumnManagerProps) {
    const [open, setOpen] = useState(false)
    const [columns, setColumns] = useState<Column[]>(currentSchema)
    const [loading, setLoading] = useState(false)
    const [editingOptionsId, setEditingOptionsId] = useState<string | null>(null)

    // Sync state when props change
    // React.useEffect(() => { setColumns(currentSchema) }, [currentSchema])

    const addColumn = () => {
        const newCol: Column = {
            id: `col_${Math.random().toString(36).substr(2, 9)}`,
            name: "New Column",
            type: "text"
        }
        setColumns([...columns, newCol])
    }

    const removeColumn = (id: string) => {
        setColumns(columns.filter(c => c.id !== id))
    }

    const updateColumn = (id: string, field: keyof Column, value: string) => {
        setColumns(columns.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ))
    }

    const handleSave = async () => {
        setLoading(true)
        const result = await updateTableSchema(tableId, columns)
        setLoading(false)
        if (result.success) {
            setOpen(false)
            // toast.success("Columns updated") 
        } else {
            alert("Failed to update columns")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Manage Columns
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingOptionsId ? "Manage Options" : "Valid Columns"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingOptionsId
                            ? "Add or remove options for the dropdown."
                            : "Define the structure of your table."}
                    </DialogDescription>
                </DialogHeader>

                {editingOptionsId ? (
                    <OptionsEditor
                        column={columns.find(c => c.id === editingOptionsId)!}
                        onBack={() => setEditingOptionsId(null)}
                        onUpdate={(opts) => {
                            setColumns(columns.map(c =>
                                c.id === editingOptionsId ? { ...c, options: opts } : c
                            ))
                        }}
                    />
                ) : (
                    <>
                        <div className="space-y-4 py-4">
                            {columns.map((col, index) => (
                                <div key={col.id} className="flex items-end gap-2 border p-2 rounded-md bg-muted/20">
                                    <div className="grid w-full gap-1.5">
                                        <Label className="text-xs">Column Name</Label>
                                        <Input
                                            value={col.name}
                                            onChange={(e) => updateColumn(col.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid w-[140px] gap-1.5">
                                        <Label className="text-xs">Type</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={col.type}
                                            onChange={(e) => updateColumn(col.id, 'type', e.target.value as any)}
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="select">Select</option>
                                        </select>
                                    </div>

                                    {col.type === 'select' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setEditingOptionsId(col.id)}
                                        >
                                            Edit Options ({(col as any).options?.length || 0})
                                        </Button>
                                    )}


                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeColumn(col.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button variant="outline" onClick={addColumn} className="w-full border-dashed">
                                <Plus className="mr-2 h-4 w-4" /> Add Column
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
