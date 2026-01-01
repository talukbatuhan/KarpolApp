"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight, Package, Truck, Clock, Database, CheckSquare, CheckCircle2, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DashboardWidgetsProps {
    tablesCount: number
    tasksCount: number
    completedTasksCount: number
    recentAuditLogs: any[]
    taskStatusStats: Record<string, number>
}

export function DashboardWidgets({ tablesCount, tasksCount, completedTasksCount, recentAuditLogs, taskStatusStats }: DashboardWidgetsProps) {
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
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Task Status Distribution
                        </CardTitle>
                        <CardDescription>
                            Visual breakdown of task statuses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskStatusChart taskStatusStats={taskStatusStats} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Helper component for the Task Status Chart
interface TaskStatusChartProps {
    taskStatusStats: Record<string, number>
}

function TaskStatusChart({ taskStatusStats }: TaskStatusChartProps) {
    // Transform data for Recharts
    const chartData = Object.entries(taskStatusStats).map(([status, count]) => ({
        name: formatStatusName(status),
        value: count,
        status: status
    }))

    // Define colors for different statuses
    const COLORS: Record<string, string> = {
        'pending': 'hsl(var(--chart-1))',
        'in_progress': 'hsl(var(--chart-2))',
        'done': 'hsl(var(--chart-3))',
        'blocked': 'hsl(var(--chart-4))',
        'cancelled': 'hsl(var(--chart-5))',
    }

    // Fallback colors
    const getColor = (status: string, index: number): string => {
        return COLORS[status] || `hsl(${(index * 360) / chartData.length}, 70%, 50%)`
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No task data available
            </div>
        )
    }

    return (
        <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getColor(entry.status, index)}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

// Custom label renderer for pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label for very small slices

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-semibold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

// Format status names for display
function formatStatusName(status: string): string {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
