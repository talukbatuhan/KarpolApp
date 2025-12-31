"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, translations } from "@/lib/i18n"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: keyof typeof translations['en']) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('language') as Language
        if (stored) setLanguage(stored)
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: keyof typeof translations['en']) => {
        return translations[language][key] || key
    }

    // Prevent hydration mismatch
    // if (!mounted) return <>{children}</>

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
