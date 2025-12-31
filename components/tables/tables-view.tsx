"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateTableDialog } from "@/app/(dashboard)/tables/create-table-dialog"
import { useLanguage } from "@/components/providers/language-provider"
import { Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTable } from "@/app/(dashboard)/tables/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TablesViewProps {
    tables: any[] | null
    userPermissions?: {
        can_create_tables?: boolean
        can_delete_tables?: boolean
    }
    userRole?: string
}

export function TablesView({ tables, userPermissions, userRole }: TablesViewProps) {
    const { t } = useLanguage()
    const router = useRouter()

    const canDelete = userRole === 'admin' || userPermissions?.can_delete_tables === true

    const handleDelete = async (tableId: string, tableName: string) => {
        const result = await deleteTable(tableId)
        if (result.success) {
            toast.success(`"${tableName}" tablosu silindi`)
            router.refresh()
        } else {
            toast.error(result.message || "Tablo silinemedi")
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('tables')}</h2>
                    <p className="text-muted-foreground">
                        {t('tables_desc')}
                    </p>
                </div>
                <CreateTableDialog userPermissions={userPermissions} userRole={userRole} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tables?.map((table) => (
                    <Card key={table.id} className="relative group">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{table.name}</span>
                                {canDelete && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tabloyu sil?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    <span className="font-semibold">{table.name}</span> tablosunu silmek üzeresiniz. Bu işlem geri alınamaz ve tablodaki tüm veriler silinecektir.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(table.id, table.name)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Sil
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardTitle>
                            <CardDescription>{table.description || t('no_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {Array.isArray(table.columns_schema) ? table.columns_schema.length : 0} {t('columns')}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link href={`/tables/${table.id}`}>{t('view_data')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {(!tables || tables.length === 0) && (
                    <div className="col-span-full text-center py-12 border border-dashed rounded-lg text-muted-foreground">
                        {t('no_tables')}
                    </div>
                )}
            </div>
        </div>
    )
}
