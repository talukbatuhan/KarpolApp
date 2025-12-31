export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    avatar_url: string | null
                    department: string | null
                    role: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    avatar_url?: string | null
                    department?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    avatar_url?: string | null
                    department?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            dynamic_tables: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    owner_id: string | null
                    columns_schema: Json
                    is_template: boolean
                    is_deleted: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    owner_id?: string | null
                    columns_schema?: Json
                    is_template?: boolean
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    owner_id?: string | null
                    columns_schema?: Json
                    is_template?: boolean
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            table_rows: {
                Row: {
                    id: string
                    table_id: string
                    data: Json
                    row_order: number
                    created_by: string | null
                    updated_by: string | null
                    is_deleted: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    table_id: string
                    data?: Json
                    row_order?: number
                    created_by?: string | null
                    updated_by?: string | null
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    table_id?: string
                    data?: Json
                    row_order?: number
                    created_by?: string | null
                    updated_by?: string | null
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
