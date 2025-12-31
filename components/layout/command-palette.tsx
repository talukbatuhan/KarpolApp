"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    Table as TableIcon,
    CheckSquare,
    LogOut,
    Languages,
    Moon,
    Sun
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/providers/language-provider"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const { t, setLanguage, language } = useLanguage()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder={t('search_placeholder')} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t('dashboard')}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/tables'))}>
                        <TableIcon className="mr-2 h-4 w-4" />
                        <span>{t('tables')}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>{t('tasks')}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('settings')}</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading={t('settings')}>
                    <CommandItem onSelect={() => runCommand(() => setLanguage('en'))}>
                        <Languages className="mr-2 h-4 w-4" />
                        <span>{t('english')} {language === 'en' && ' (Active)'}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setLanguage('tr'))}>
                        <Languages className="mr-2 h-4 w-4" />
                        <span>{t('turkish')} {language === 'tr' && ' (Active)'}</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
