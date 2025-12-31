"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AuditLogsViewProps {
    logs: any[]
}

export function AuditLogsView({ logs: initialLogs }: AuditLogsViewProps) {
    const { t, language } = useLanguage()
    const [logs, setLogs] = useState(initialLogs)
    const [searchTerm, setSearchTerm] = useState("")
    const [actionFilter, setActionFilter] = useState("all")
    const [tableSchemas, setTableSchemas] = useState<Record<string, any>>({})

    const supabase = createClient() as any

    // Fetch Table Schemas for mapping column IDs to names
    useEffect(() => {
        const fetchSchemas = async () => {
            const { data } = await supabase.from('dynamic_tables').select('id, name, columns_schema')
            if (data) {
                const schemaMap: Record<string, any> = {}
                data.forEach(table => {
                    schemaMap[table.id] = table
                })
                setTableSchemas(schemaMap)
            }
        }
        fetchSchemas()
    }, [])

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('audit_logs_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                async (payload) => {
                    const newLog = payload.new as any

                    // Fetch user details for notification
                    const { data: user } = await supabase.from('profiles').select('full_name').eq('id', newLog.performed_by).single()
                    const userName = user?.full_name || 'System'

                    toast(`${newLog.action} by ${userName}`, {
                        description: `Entity: ${newLog.entity_type}`,
                    })

                    // Fetch complete log to add to list
                    const { data: completeLog } = await supabase
                        .from('audit_logs')
                        .select('*, performed_by_user:profiles!performed_by(full_name, email)')
                        .eq('id', newLog.id)
                        .single()

                    if (completeLog) {
                        setLogs(prev => [completeLog, ...prev])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'default' // black/white
            case 'UPDATE': return 'secondary' // gray
            case 'DELETE': return 'destructive' // red
            default: return 'outline'
        }
    }

    // Filter Logic
    const filteredLogs = logs?.filter(log => {
        const matchesSearch =
            (log.entity_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.performed_by_user?.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.performed_by_user?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())

        const matchesAction = actionFilter === "all" || log.action === actionFilter

        return matchesSearch && matchesAction
    })

    // Helper to map column ID to Name
    const getColumnName = (tableId: string | null, colId: string) => {
        if (!tableId || !tableSchemas[tableId]) return colId
        const schema = tableSchemas[tableId].columns_schema
        const col = schema?.find((c: any) => c.id === colId)
        return col ? col.name : colId
    }

    // Helper to extract clean details
    const getCleanDetails = (log: any) => {
        const data = log.action === 'DELETE' ? log.old_data : log.new_data
        if (!data) return "No data"

        // If it's a table row, show the 'data' field content with mapped column names
        if (log.entity_type === 'table_rows' && data.data) {
            return Object.entries(data.data)
                .map(([k, v]) => {
                    const colName = getColumnName(log.table_id, k)
                    return `${colName}: ${v}`
                })
                .join(", ")
        }

        // If it's a dynamic table
        if (log.entity_type === 'dynamic_tables') {
            const parts = []
            if (data.name) parts.push(`Name: ${data.name}`)
            if (data.description) parts.push(`Desc: ${data.description}`)
            return parts.join(", ")
        }

        // Flatten simple keys for other entities
        // Exclude internal keys
        const ignoredKeys = ['id', 'created_at', 'updated_at', 'avatar_url', 'table_id', 'owner_id', 'is_deleted']
        const cleanParts = Object.entries(data)
            .filter(([k]) => !ignoredKeys.includes(k) && typeof data[k] !== 'object')
            .map(([k, v]) => `${k}: ${v}`)

        if (cleanParts.length > 0) return cleanParts.join(", ")

        return "Complex Update"
    }

    // Detailed View for Modal
    const renderDetailView = (log: any) => {
        const data = log.action === 'DELETE' ? log.old_data : log.new_data
        if (!data) return <div className="text-muted-foreground">No data available</div>

        let displayData = data
        let isRowData = false
        if (log.entity_type === 'table_rows' && data.data) {
            displayData = data.data
            isRowData = true
        }

        return (
            <div className="grid gap-2">
                {Object.entries(displayData).map(([key, value]: [string, any]) => {
                    if (['id', 'table_id', 'created_at', 'updated_at', 'owner_id'].includes(key)) return null;

                    let displayKey = key
                    if (isRowData) {
                        displayKey = getColumnName(log.table_id, key)
                    }

                    return (
                        <div key={key} className="grid grid-cols-3 items-start border-b pb-2 last:border-0">
                            <span className="font-medium text-sm text-muted-foreground">{displayKey}</span>
                            <span className="col-span-2 text-sm font-mono break-all">{String(value)}</span>
                        </div>
                    )
                })}
                {Object.keys(displayData).length === 0 && (
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('audit_logs')}</h2>
                <p className="text-muted-foreground">
                    {t('audit_desc')}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('filter_placeholder')}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder={t('action')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all_actions')}</SelectItem>
                        <SelectItem value="INSERT">INSERT</SelectItem>
                        <SelectItem value="UPDATE">UPDATE</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>{t('recent_activity')} <Badge variant="outline" className="ml-2">{filteredLogs?.length || 0}</Badge></CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">{t('action')}</TableHead>
                                    <TableHead>{t('entity')}</TableHead>
                                    <TableHead>{t('user')}</TableHead>
                                    <TableHead className="w-[40%]">{t('details')}</TableHead>
                                    <TableHead className="text-right">{t('date')}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs?.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant={getActionColor(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.entity_type}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{log.performed_by_user?.full_name || 'System'}</span>
                                                <span className="text-xs text-muted-foreground">{log.performed_by_user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="line-clamp-2" title={getCleanDetails(log)}>
                                                {getCleanDetails(log)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap text-xs">
                                            {formatDate(log.performed_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>{t('view_details')}</DialogTitle>
                                                        <DialogDescription>
                                                            {log.action} on {log.entity_type} by {log.performed_by_user?.full_name}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-medium mb-2">{t('changes')}</h4>
                                                        <div className="rounded-md border p-4 bg-muted/20">
                                                            {renderDetailView(log)}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {(!filteredLogs || filteredLogs.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            {t('no_logs')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
