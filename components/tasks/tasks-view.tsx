"use client"

import { CreateTaskDialog } from "@/app/(dashboard)/tasks/create-task-dialog"
import { TaskItem } from "@/app/(dashboard)/tasks/task-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/language-provider"

interface TasksViewProps {
    tasks: any[] | null
    total: number
    pending: number
    done: number
}

export function TasksView({ tasks, total, pending, done }: TasksViewProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('tasks')}</h2>
                    <p className="text-muted-foreground">
                        {t('tasks_desc')}
                    </p>
                </div>
                <CreateTaskDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('pending_tasks')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('completed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{done}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('total')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {tasks?.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
                {total === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        {t('no_tasks')}
                    </div>
                )}
            </div>
        </div>
    )
}
