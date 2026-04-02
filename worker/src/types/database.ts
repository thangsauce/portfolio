// Auto-generated Supabase types placeholder.
// Replace this file with output from:
//   npx supabase gen types typescript --project-id <your-project-id>
// Or copy from Supabase Dashboard → Settings → API → TypeScript Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      portfolio_projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          long_description: string | null
          category: string
          tech_stack: string[]
          source_code_url: string | null
          live_url: string | null
          images: Json
          featured: boolean
          year: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          long_description?: string | null
          category?: string
          tech_stack?: string[]
          source_code_url?: string | null
          live_url?: string | null
          images?: Json
          featured?: boolean
          year?: number | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          long_description?: string | null
          category?: string
          tech_stack?: string[]
          source_code_url?: string | null
          live_url?: string | null
          images?: Json
          featured?: boolean
          year?: number | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          icon_url: string | null
          order_index: number
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          icon_url?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          icon_url?: string | null
          order_index?: number
        }
        Relationships: []
      }
      stacks: {
        Row: {
          id: string
          name: string
          category: string | null
          icon_url: string | null
          order_index: number
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          icon_url?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          icon_url?: string | null
          order_index?: number
        }
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          name: string
          issuer: string | null
          issue_date: string | null
          credential_id: string | null
          url: string | null
          order_index: number
        }
        Insert: {
          id?: string
          name: string
          issuer?: string | null
          issue_date?: string | null
          credential_id?: string | null
          url?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          name?: string
          issuer?: string | null
          issue_date?: string | null
          credential_id?: string | null
          url?: string | null
          order_index?: number
        }
        Relationships: []
      }
      experiences: {
        Row: {
          id: string
          company: string
          role: string
          start_date: string | null
          end_date: string | null
          description: string[]
          order_index: number
        }
        Insert: {
          id?: string
          company: string
          role: string
          start_date?: string | null
          end_date?: string | null
          description?: string[]
          order_index?: number
        }
        Update: {
          id?: string
          company?: string
          role?: string
          start_date?: string | null
          end_date?: string | null
          description?: string[]
          order_index?: number
        }
        Relationships: []
      }
    }
  }
}
