"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Trash2, Clock, PlayCircle } from "lucide-react"
import { toggleTaskStatus, deleteTask, updateTaskStatus } from "@/app/(dashboard)/tasks/actions" // Need to ensure updateTaskStatus exists or use toggle
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// We might want a specialized action for moving between columns later, but for now toggle/update is enough.

export function TaskItem({ task }: { task: any }) {
    const isDone = task.status === 'done'
    const isInProgress = task.status === 'in_progress'
    const isTodo = task.status === 'todo'

    // Helper to move task to next stage
    const handleStatusChange = async (newStatus: string) => {
        await updateTaskStatus(task.id, newStatus)
    }

    return (
        <Card className={cn("transition-all hover:shadow-md", isDone && "opacity-60")}>
            <CardContent className="p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <span className={cn("font-medium text-sm line-clamp-2", isDone && "line-through text-muted-foreground")}>
                        {task.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1 h-5 whitespace-nowrap">{task.assigned_department}</Badge>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-muted/50">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {task.due_date && (
                            <span className={cn(
                                new Date(task.due_date) < new Date() && !isDone && "text-destructive font-bold"
                            )}>
                                {new Date(task.due_date).toLocaleDateString()}
                            </span>
                        )}
                        {!task.due_date && <span>No Due Date</span>}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Status Controls */}
                        {isTodo && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500" onClick={() => handleStatusChange('in_progress')} title="Start">
                                <PlayCircle className="h-4 w-4" />
                            </Button>
                        )}
                        {isInProgress && (
                            <>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleStatusChange('todo')} title="Back to Todo">
                                    <Clock className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => handleStatusChange('done')} title="Complete">
                                    <CheckCircle2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        {isDone && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleStatusChange('in_progress')} title="Reopen">
                                <Clock className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive/50 hover:text-destructive"
                            onClick={() => {
                                if (confirm("Delete task?")) deleteTask(task.id)
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
