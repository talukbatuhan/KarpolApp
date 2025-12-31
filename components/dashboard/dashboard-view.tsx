"use client"

import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets"
import { useLanguage } from "@/components/providers/language-provider"

interface DashboardViewProps {
    tablesCount: number
    tasksCount: number
    completedTasksCount: number
    recentAuditLogs: any[]
}

export function DashboardView({ tablesCount, tasksCount, completedTasksCount, recentAuditLogs }: DashboardViewProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 mb-8">
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 w-fit">
                    {t('dashboard')}
                </h2>
                <p className="text-muted-foreground">
                    {t('dashboard_desc')}
                </p>
            </div>

            <DashboardWidgets
                tablesCount={tablesCount}
                tasksCount={tasksCount}
                completedTasksCount={completedTasksCount}
                recentAuditLogs={recentAuditLogs}
            />
        </div>
    )
}
