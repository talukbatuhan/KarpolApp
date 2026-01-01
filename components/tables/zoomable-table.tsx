'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Save } from 'lucide-react'

interface CellData {
    value: string
    row: number
    col: number
}

interface CellPosition {
    row: number
    col: number
}

export function ZoomableTable() {
    const [data, setData] = useState<string[][]>([
        ['Product', 'Category', 'Price', 'Stock', 'Supplier'],
        ['Laptop Dell XPS', 'Electronics', '$1299', '45', 'TechCorp'],
        ['Office Chair', 'Furniture', '$299', '120', 'FurniPro'],
        ['Coffee Maker', 'Appliances', '$89', '78', 'HomeGoods'],
        ['Wireless Mouse', 'Electronics', '$25', '200', 'TechCorp'],
        ['Standing Desk', 'Furniture', '$599', '35', 'FurniPro'],
        ['Monitor 27"', 'Electronics', '$349', '62', 'DisplayTech'],
        ['Desk Lamp', 'Lighting', '$45', '150', 'LightingCo'],
        ['Notebook Set', 'Stationery', '$12', '500', 'PaperWorld'],
        ['Keyboard Mechanical', 'Electronics', '$129', '85', 'TechCorp'],
        ['Bookshelf', 'Furniture', '$189', '40', 'FurniPro']
    ])

    const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null)
    const [editingValue, setEditingValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input when cell is selected
    useEffect(() => {
        if (selectedCell && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [selectedCell])

    const handleCellClick = (row: number, col: number) => {
        setSelectedCell({ row, col })
        setEditingValue(data[row][col])
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingValue(e.target.value)
    }

    const handleInputBlur = () => {
        if (selectedCell) {
            const newData = [...data]
            newData[selectedCell.row][selectedCell.col] = editingValue
            setData(newData)
        }
        setSelectedCell(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur()
        } else if (e.key === 'Escape') {
            setSelectedCell(null)
        }
    }

    const addRow = () => {
        const newRow = Array(data[0].length).fill('')
        setData([...data, newRow])
    }

    return (
        <Card className="bg-background/50 backdrop-blur-lg border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Zoomable Data Table
                </CardTitle>
                <CardDescription>
                    Click on any cell to enter edit mode with zoomed view
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Table */}
                    <div className="relative overflow-x-auto rounded-md border border-border/50">
                        <table className="w-full border-collapse">
                            <tbody>
                                {data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={rowIndex === 0 ? 'bg-muted/50' : 'hover:bg-muted/30 transition-colors'}
                                    >
                                        {row.map((cell, colIndex) => (
                                            <td
                                                key={`${rowIndex}-${colIndex}`}
                                                className={`
                                                    relative border border-border/30 p-0
                                                    ${rowIndex === 0 ? 'font-semibold' : 'cursor-pointer'}
                                                    ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'z-50' : ''}
                                                `}
                                                onClick={() => rowIndex !== 0 && handleCellClick(rowIndex, colIndex)}
                                            >
                                                {selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? (
                                                    <div className="absolute inset-0 z-50">
                                                        {/* Zoomed cell container */}
                                                        <div
                                                            className="absolute bg-background border-2 border-primary shadow-2xl rounded-md overflow-hidden animate-in zoom-in-95 duration-200"
                                                            style={{
                                                                width: '300px',
                                                                minHeight: '80px',
                                                                left: '50%',
                                                                top: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                            }}
                                                        >
                                                            <input
                                                                ref={inputRef}
                                                                type="text"
                                                                value={editingValue}
                                                                onChange={handleInputChange}
                                                                onBlur={handleInputBlur}
                                                                onKeyDown={handleKeyDown}
                                                                className="w-full h-full px-4 py-3 text-lg bg-transparent border-none outline-none focus:ring-0"
                                                                placeholder="Enter value..."
                                                            />
                                                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                                                Press Enter to save, Esc to cancel
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-2 min-w-[120px] text-sm truncate">
                                                        {cell || '—'}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={addRow} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Row
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-muted/50 rounded-md p-3">
                            <div className="text-xs text-muted-foreground">Total Rows</div>
                            <div className="text-2xl font-bold">{data.length - 1}</div>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3">
                            <div className="text-xs text-muted-foreground">Total Columns</div>
                            <div className="text-2xl font-bold">{data[0]?.length || 0}</div>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3">
                            <div className="text-xs text-muted-foreground">Total Cells</div>
                            <div className="text-2xl font-bold">{(data.length - 1) * (data[0]?.length || 0)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
