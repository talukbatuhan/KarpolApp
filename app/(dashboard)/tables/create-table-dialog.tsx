"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createTable } from "./create-table-action"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Table"}
        </Button>
    )
}

export function CreateTableDialog() {
    const [open, setOpen] = useState(false)
    const [state, setState] = useState<{ message?: string; errors?: any; tableId?: string } | null>(null)
    const router = useRouter()

    async function clientAction(formData: FormData) {
        const result = await createTable(null, formData)
        if (result?.tableId) {
            setOpen(false)
            router.push(`/tables/${result.tableId}`)
        } else {
            setState(result)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Table
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                    <DialogDescription>
                        Give your table a name. You can add columns later.
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue=""
                                className="col-span-3"
                                required
                            />
                        </div>
                        {state?.errors?.name && (
                            <p className="text-red-500 text-sm ml-auto col-span-3">{state.errors.name}</p>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue=""
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
