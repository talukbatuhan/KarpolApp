"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { ExcelImportExport } from "@/components/shared/excel-import-export"
import { importRows } from "@/app/(dashboard)/tables/[tableId]/actions"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Database, Json } from "@/types/database.types"

type DynamicTable = Database['public']['Tables']['dynamic_tables']['Row']
type TableRowData = Database['public']['Tables']['table_rows']['Row']

import { useRealtimeTable } from "./use-realtime"
import { useRouter } from "next/navigation"
import { ColumnManager } from "./column-manager"
import { AddRowDialog } from "./add-row-dialog"
import { deleteRow } from "@/app/(dashboard)/tables/[tableId]/actions"
import { EditableCell } from "./editable-cell"
import { TablePermissions } from "./table-permissions"

interface TableEditorProps {
    tableDefinition: DynamicTable
    initialRows: TableRowData[]
    userPermissions?: any
    userRole?: string
}

export function TableEditor({ tableDefinition, initialRows, userPermissions, userRole }: TableEditorProps) {
    const [data, setData] = React.useState<TableRowData[]>(initialRows)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const router = useRouter()

    // Update local state when initialRows changes (e.g. after server re-render from realtime)
    React.useEffect(() => {
        setData(initialRows)
    }, [initialRows])

    // Enable Realtime
    useRealtimeTable({
        tableId: tableDefinition.id,
        onUpdate: () => {
            // Refresh the server component to get fresh data
            router.refresh()
        }
    })

    // ... inside TableEditor ...

    // Helper to get schema as array
    const schema = React.useMemo(() => {
        return tableDefinition.columns_schema as Array<{ id: string; name: string; type: string }> || []
    }, [tableDefinition.columns_schema])

    // Dynamically generate columns based on schema
    const columns = React.useMemo<ColumnDef<TableRowData>[]>(() => {
        // 1. Static ID Column (optional)
        const dynamicCols: ColumnDef<TableRowData>[] = [
            {
                accessorKey: "row_order",
                header: "#",
                cell: (info) => info.row.index + 1,
                size: 50,
            }
        ]

        schema.forEach((col) => {
            dynamicCols.push({
                id: col.id,
                accessorFn: (row) => {
                    const rowData = row.data as Record<string, any>
                    return rowData?.[col.id]
                },
                header: col.name,
                cell: (info) => <EditableCell {...info} />,
                meta: {
                    type: (col as any).type,
                    options: (col as any).options
                }
            })
        })

        // 3. Actions Column
        dynamicCols.push({
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const handleDelete = async () => {
                    if (confirm("Are you sure?")) {
                        await deleteRow(row.original.id, tableDefinition.id)
                    }
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>Delete row</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        })

        return dynamicCols
    }, [schema, tableDefinition.id])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    const handleImport = async (importedData: any[]) => {
        const result = await importRows(tableDefinition.id, importedData)
        if (result.success) {
            toast.success(result.message)
            router.refresh()
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">{tableDefinition.name}</h2>
                    <span className="text-sm text-muted-foreground ml-2">
                        {data.length} rows
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <ExcelImportExport
                        data={data.map(r => r.data)}
                        fileName={`${tableDefinition.name}-export`}
                        onImport={handleImport}
                    />
                    <TablePermissions tableId={tableDefinition.id} ownerId={tableDefinition.owner_id} />
                    <ColumnManager tableId={tableDefinition.id} currentSchema={schema as any} />
                    <AddRowDialog
                        tableId={tableDefinition.id}
                        schema={schema as any}
                        userPermissions={userPermissions}
                        userRole={userRole}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div >
    )
}
