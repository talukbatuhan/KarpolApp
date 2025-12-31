"use client"

import { useState } from "react"
import { TaskItem } from "./task-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { CreateTaskDialog } from "@/app/(dashboard)/tasks/create-task-dialog"

interface TasksBoardProps {
    tasks: any[]
}

export function TasksBoard({ tasks }: TasksBoardProps) {
    const { t } = useLanguage()

    // Filter tasks by status
    const todoTasks = tasks.filter(t => t.status === 'todo')
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
    const doneTasks = tasks.filter(t => t.status === 'done')

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('tasks')}</h2>
                <CreateTaskDialog />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
                {/* TODO Column */}
                <div className="flex flex-col bg-muted/30 rounded-lg border p-4 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            Yapılacaklar
                            <Badge variant="secondary" className="ml-2">{todoTasks.length}</Badge>
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-3">
                            {todoTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                            {todoTasks.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-md">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* IN PROGRESS Column */}
                <div className="flex flex-col bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900 p-4 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            Yapılıyor
                            <Badge variant="outline" className="ml-2 border-blue-200 text-blue-700">{inProgressTasks.length}</Badge>
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-3">
                            {inProgressTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                            {inProgressTasks.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-blue-200 rounded-md">
                                    No active tasks
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* DONE Column */}
                <div className="flex flex-col bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900 p-4 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                            Tamamlandı
                            <Badge variant="outline" className="ml-2 border-green-200 text-green-700">{doneTasks.length}</Badge>
                        </h3>
                    </div>
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-3">
                            {doneTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                            {doneTasks.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-green-200 rounded-md">
                                    No completed tasks
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
