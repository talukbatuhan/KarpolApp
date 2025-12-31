import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "./user-auth-form"

export const metadata: Metadata = {
    title: "Giriş Yap | Karpol App",
    description: "Login to your account",
}

export const dynamic = 'force-dynamic'

export default function LoginPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <Image src="/logo.png" alt="Karpol Logo" width={64} height={64} className="h-16 w-16 rounded-xl shadow-lg" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your account
                </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/register"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Don&apos;t have an account? Sign Up
                </Link>
            </p>
        </>
    )
}
