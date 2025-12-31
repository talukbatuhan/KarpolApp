"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { UserNav } from "@/components/layout/user-nav"
import { CommandPalette } from "@/components/layout/command-palette"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { NotificationCenter } from "@/components/layout/notification-center"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function DashboardContent({ children, role }: { children: React.ReactNode, role: string | null }) {
    const { t } = useLanguage()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    // Sidebar Content Component
    const SidebarContent = () => (
        <>
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
                    K
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Karpol Panel
                </h1>
            </div>
            <nav className="space-y-1">
                <Link href="/" className={cn("flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105", pathname === "/" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                    {t('dashboard')}
                </Link>
                <Link href="/tables" className={cn("flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105", pathname.startsWith("/tables") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                    {t('tables')}
                </Link>
                <Link href="/tasks" className={cn("flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105", pathname.startsWith("/tasks") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                    {t('tasks')}
                </Link>
                <Link href="/settings" className={cn("flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105", pathname.startsWith("/settings") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                    {t('settings')}
                </Link>

                {role === 'admin' && (
                    <>
                        <div className="pt-6 pb-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-50">
                            {t('admin_section')}
                        </div>
                        <Link href="/admin/audit-logs" className={cn("flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105", pathname.startsWith("/admin/audit-logs") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary text-muted-foreground")}>
                            {t('audit_logs')}
                        </Link>
                    </>
                )}
            </nav>
        </>
    )

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background font-sans selection:bg-primary/20">
            <CommandPalette />

            {/* Desktop Sidebar - Glass Effect */}
            <aside
                className={cn(
                    "fixed md:sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out hidden md:block border-r border-border/40",
                    "bg-background/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40",
                    sidebarOpen ? "w-64" : "w-0 border-none overflow-hidden"
                )}
            >
                <div className={cn("w-64 p-6 h-full flex flex-col", sidebarOpen ? "opacity-100" : "opacity-0 invisible")}>
                    <SidebarContent />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <header className={cn(
                    "h-16 flex items-center justify-between px-6 sticky top-0 z-20 gap-4 transition-all duration-200",
                    "bg-background/40 backdrop-blur-2xl border-b border-border/40"
                )}>
                    <div className="flex items-center gap-4">
                        {/* Mobile Sheet Trigger */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-64 p-6 bg-background/95 backdrop-blur-xl">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Desktop Toggle Trigger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex hover:bg-primary/10 hover:text-primary"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 text-muted-foreground text-xs hover:bg-muted transition-colors cursor-pointer" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                            <span>Search</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background border px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <NotificationCenter />
                        <UserNav />
                    </div>
                </header>
                <div className="p-6 flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
