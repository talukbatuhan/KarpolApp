"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface ExcelImportExportProps {
    data?: any[]
    fileName?: string
    onImport?: (data: any[]) => void
    disabled?: boolean
}

export function ExcelImportExport({
    data = [],
    fileName = "export",
    onImport,
    disabled = false
}: ExcelImportExportProps) {
    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)

    const handleExport = () => {
        try {
            setIsExporting(true)
            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
            XLSX.writeFile(workbook, `${fileName}.xlsx`)
            toast.success("Excel dosyası başarıyla indirildi")
        } catch (error) {
            console.error(error)
            toast.error("Excel dışa aktarma hatası")
        } finally {
            setIsExporting(false)
        }
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!onImport) return

        setIsImporting(true)
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: "binary" })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)
                onImport(jsonData)
                toast.success(`${jsonData.length} kayıt başarıyla okundu`)
            } catch (error) {
                console.error(error)
                toast.error("Excel okuma hatası")
            } finally {
                setIsImporting(false)
                // Reset input
                const input = document.getElementById("excel-upload") as HTMLInputElement
                if (input) input.value = ""
            }
        }

        reader.readAsBinaryString(file)
    }

    return (
        <div className="flex items-center gap-2">
            {onImport && (
                <div className="relative">
                    <input
                        type="file"
                        id="excel-upload"
                        accept=".xlsx, .xls"
                        onChange={handleImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={disabled || isImporting}
                    />
                    <Button variant="outline" size="sm" className="gap-2" disabled={disabled || isImporting}>
                        <Upload className="h-4 w-4" />
                        {isImporting ? "Yükleniyor..." : "İçe Aktar"}
                    </Button>
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExport}
                disabled={disabled || isExporting || data.length === 0}
            >
                {isExporting ? (
                    <Download className="h-4 w-4 animate-bounce" />
                ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                )}
                Excel İndir
            </Button>
        </div>
    )
}
