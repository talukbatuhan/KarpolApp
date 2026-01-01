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
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-600/30 blur-xl rounded-full animate-pulse" />
                        {/* 
                        <Image
                            src="/logo.png"
                            alt="Karpol Logo"
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-xl shadow-[0_0_40px_-8px_rgba(168,85,247,0.4)] relative z-10"
                        />
                        */}
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-text">
                    Welcome back
                </h1>
                <p className="text-sm text-slate-400">
                    Enter your credentials to access your account
                </p>
            </div>
            <UserAuthForm />
        </>
    )
}
