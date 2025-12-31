"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight, Package, Truck, Clock, Database, CheckSquare, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardWidgetsProps {
    tablesCount: number
    tasksCount: number
    completedTasksCount: number
    recentAuditLogs: any[]
}

export function DashboardWidgets({ tablesCount, tasksCount, completedTasksCount, recentAuditLogs }: DashboardWidgetsProps) {
    const completionRate = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0

    return (
        <div className="space-y-8 animate-in fade-in-up duration-700">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="decoration-primary/20 bg-background/50 backdrop-blur-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Dynamic Tables</CardTitle>
                        <Database className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{tablesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Active Tables
                        </p>
                    </CardContent>
                </Card>
                <Card className="decoration-primary/20 bg-background/50 backdrop-blur-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{tasksCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            System Wide
                        </p>
                    </CardContent>
                </Card>
                <Card className="decoration-primary/20 bg-background/50 backdrop-blur-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{completedTasksCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Finished
                        </p>
                    </CardContent>
                </Card>
                <Card className="decoration-primary/20 bg-background/50 backdrop-blur-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">%{completionRate}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center text-blue-500">
                            Performance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-background/50 backdrop-blur-lg border-primary/10">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest actions performed in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentAuditLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity found.</p>
                            ) : (
                                recentAuditLogs.map((log) => (
                                    <div className="flex items-center group cursor-pointer" key={log.id}>
                                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Package className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                {log.action} on {log.entity_type}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {log.action === 'CREATE' ? 'Created new entry' :
                                                    log.action === 'UPDATE' ? 'Updated record' :
                                                        log.action === 'DELETE' ? 'Deleted item' : 'System action'}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {new Date(log.performed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-background/50 backdrop-blur-lg border-primary/10">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 rounded-sm border border-border/50 p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                            <Truck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">New Shipment</p>
                                <p className="text-sm text-muted-foreground">
                                    Create a new delivery record.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-sm border border-border/50 p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                            <Clock className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Time Logs</p>
                                <p className="text-sm text-muted-foreground">
                                    Review access hours.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
