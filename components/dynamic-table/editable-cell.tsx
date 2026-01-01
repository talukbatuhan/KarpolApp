"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateRowData } from "@/app/(dashboard)/tables/[tableId]/actions"
import { cn } from "@/lib/utils"

interface EditableCellProps {
    getValue: () => any
    row: any
    column: any
    table: any
    // We assume column def might have 'columnDef.meta.type' or similar if we passed schema down.
    // However, TanStack table structure: column.columnDef.meta
    // The schema is not directly attached to column def by default in my previous code.
    // I need to check how TableEditor passes columns.
    // It passes `dynamicCols` where I can attach meta type.
}

// Helper to auto-resize textarea
const AutoResizeTextarea = ({ value, onChange, onBlur, onKeyDown, autoFocus }: any) => {
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto"
            ref.current.style.height = ref.current.scrollHeight + "px"
        }
    }, [value])

    useEffect(() => {
        if (autoFocus && ref.current) {
            ref.current.focus()
            // cursor at end
            ref.current.setSelectionRange(ref.current.value.length, ref.current.value.length)
        }
    }, [autoFocus])

    return (
        <textarea
            ref={ref}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden min-h-[38px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            rows={1}
        />
    )
}

export function EditableCell({ getValue, row, column, table }: EditableCellProps) {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)
    const [isEditing, setIsEditing] = useState(false)
    const [cellPosition, setCellPosition] = useState({ top: 0, left: 0 })
    const cellRef = useRef<HTMLDivElement>(null)

    // Attempt to get column definition directly
    // Ideally we pass schema info in column definition meta
    // But for now, let's infer or use a prop if available.
    // In `TableEditor`, we create columns. We should pass the type there.
    const columnType = (column.columnDef as any).meta?.type || 'text'
    const columnOptions = (column.columnDef as any).meta?.options || []

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const handleEditStart = () => {
        if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect()
            setCellPosition({
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2,
            })
        }
        setIsEditing(true)
    }

    const onBlur = async () => {
        setIsEditing(false)
        if (value !== initialValue) {
            const rowId = row.original.id
            const tableId = row.original.table_id
            const colId = column.id
            const currentData = row.original.data || {}
            const newData = { ...currentData, [colId]: value }

            const result = await updateRowData(rowId, tableId, newData)
            if (!result.success) {
                setValue(initialValue)
                // toast.error("Failed to save")
            }
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onBlur()
        } else if (e.key === "Escape") {
            setValue(initialValue)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        if (columnType === 'select') {
            return (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => {
                            setValue(initialValue)
                            setIsEditing(false)
                        }}
                    />
                    {/* Zoom Box for Select */}
                    <div
                        className="fixed z-50 bg-background border-2 border-primary rounded-lg shadow-2xl p-4 animate-in zoom-in-95 duration-200"
                        style={{
                            top: `${cellPosition.top}px`,
                            left: `${cellPosition.left}px`,
                            transform: 'translate(-50%, -50%)',
                            minWidth: '300px',
                            minHeight: '80px',
                        }}
                    >
                        <Select
                            value={value as string}
                            onValueChange={(val) => {
                                setValue(val)
                                const rowId = row.original.id
                                const tableId = row.original.table_id
                                const colId = column.id
                                const currentData = row.original.data || {}
                                const newData = { ...currentData, [colId]: val }
                                updateRowData(rowId, tableId, newData)
                                setIsEditing(false)
                            }}
                            open={true}
                            onOpenChange={(open) => {
                                if (!open) setIsEditing(false)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full text-lg">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {columnOptions.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground mt-2 text-center">
                            Press Esc to cancel
                        </div>
                    </div>
                </>
            )
        }

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => {
                        setValue(initialValue)
                        setIsEditing(false)
                    }}
                />
                {/* Zoom Box */}
                <div
                    className="fixed z-50 bg-background border-2 border-primary rounded-lg shadow-2xl p-4 animate-in zoom-in-95 duration-200"
                    style={{
                        top: `${cellPosition.top}px`,
                        left: `${cellPosition.left}px`,
                        transform: 'translate(-50%, -50%)',
                        minWidth: '300px',
                        minHeight: '80px',
                    }}
                >
                    <AutoResizeTextarea
                        autoFocus
                        value={value as string || ""}
                        onChange={setValue}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                    />
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                        Press Enter to save • Esc to cancel
                    </div>
                </div>
            </>
        )
    }

    return (
        <div
            ref={cellRef}
            onClick={handleEditStart}
            className={cn(
                "cursor-pointer hover:bg-muted/50 p-2 rounded min-h-[2.5rem] flex items-center whitespace-pre-wrap break-words transition-colors",
                !value && "text-muted-foreground italic text-xs h-8"
            )}
        >
            {/* If it's a select, maybe show a badge or just text? Text is fine. */}
            {value || "Empty"}
        </div>
    )
}

