"use client"

import { toast } from "sonner"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createTask } from "./actions"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

function SubmitButton() {
    const { pending } = useFormStatus()
    return <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create Task"}</Button>
}

export function CreateTaskDialog() {
    const [open, setOpen] = useState(false)

    // Wrapper to handle close on success
    async function clientAction(formData: FormData) {
        const res = await createTask(null, formData)
        if (res?.message === "Task created") {
            setOpen(false)
            toast.success("Task created successfully")
        } else if (res?.errors) {
            const errorMessages = Object.values(res.errors).flat().join(', ')
            toast.error("Please check your input", {
                description: errorMessages
            })
        } else {
            toast.error("Failed to create task", {
                description: res?.message || "Unknown error occurred"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Assign a task to a department.
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction} className="space-y-4">
                    <div className="grid w-full gap-1.5 ">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                    </div>

                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" />
                    </div>

                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="assigned_department">Department</Label>
                        <Select name="assigned_department" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HR">HR</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input id="due_date" name="due_date" type="date" />
                    </div>

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
