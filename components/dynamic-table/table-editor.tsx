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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{tableDefinition.name}</h2>
                    <p className="text-muted-foreground mt-1">{tableDefinition.description}</p>
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

            {/* Table Card */}
            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className="font-semibold text-foreground border-r last:border-r-0"
                                            >
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
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="border-r last:border-r-0 relative"
                                            >
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
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Rows</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{data.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Columns</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{schema.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Cells</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{data.length * schema.length}</p>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of{" "}
                    {data.length} rows
                </div>
                <div className="flex items-center space-x-2">
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
