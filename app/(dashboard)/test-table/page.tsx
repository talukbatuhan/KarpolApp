import { ZoomableTable } from '@/components/tables/zoomable-table'

export default function TestTablePage() {
    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Zoomable Table Demo
                </h1>
                <p className="text-muted-foreground">
                    Test the zoom functionality by clicking on any cell in the table below.
                </p>
            </div>

            <ZoomableTable />
        </div>
    )
}
