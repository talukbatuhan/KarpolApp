"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateTableDialog } from "@/app/(dashboard)/tables/create-table-dialog"
import { useLanguage } from "@/components/providers/language-provider"

interface TablesViewProps {
    tables: any[] | null
}

export function TablesView({ tables }: TablesViewProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('tables')}</h2>
                    <p className="text-muted-foreground">
                        {t('tables_desc')}
                    </p>
                </div>
                <CreateTableDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tables?.map((table) => (
                    <Card key={table.id}>
                        <CardHeader>
                            <CardTitle>{table.name}</CardTitle>
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
