import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Tipos para as tabelas do Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
          company_id: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
          company_id: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
          company_id?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          cnpj: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          cnpj: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          cnpj?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products_base: {
        Row: {
          id: string
          sku: string
          title: string
          description: string
          price_cash: number
          price_points: number
          category: string
          active: boolean
          tenant_id: string
          media: string[]
          variations: any[]
          created_by: string
          updated_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          title: string
          description?: string
          price_cash: number
          price_points: number
          category: string
          active?: boolean
          tenant_id: string
          media?: string[]
          variations?: any[]
          created_by: string
          updated_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          title?: string
          description?: string
          price_cash?: number
          price_points?: number
          category?: string
          active?: boolean
          tenant_id?: string
          media?: string[]
          variations?: any[]
          created_by?: string
          updated_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          status:
            | 'draft'
            | 'submitted'
            | 'reviewed'
            | 'approved'
            | 'rejected'
            | 'expired'
          tenant_id: string
          customer_tenant_id: string
          created_by: string
          updated_by: string
          total_cash: number
          total_points: number
          shipping_policy?: string
          taxes_hint?: string
          notes?: string
          expires_at?: string
          meta?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?:
            | 'draft'
            | 'submitted'
            | 'reviewed'
            | 'approved'
            | 'rejected'
            | 'expired'
          tenant_id: string
          customer_tenant_id: string
          created_by: string
          updated_by: string
          total_cash: number
          total_points: number
          shipping_policy?: string
          taxes_hint?: string
          notes?: string
          expires_at?: string
          meta?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?:
            | 'draft'
            | 'submitted'
            | 'reviewed'
            | 'approved'
            | 'rejected'
            | 'expired'
          tenant_id?: string
          customer_tenant_id?: string
          created_by?: string
          updated_by?: string
          total_cash?: number
          total_points?: number
          shipping_policy?: string
          taxes_hint?: string
          notes?: string
          expires_at?: string
          meta?: any
          created_at?: string
          updated_at?: string
        }
      }
      budget_items: {
        Row: {
          id: string
          budget_id: string
          product_id: string
          qty: number
          unit_price: number
          unit_points: number
          notes?: string
          subtotal_cash: number
          subtotal_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          product_id: string
          qty: number
          unit_price: number
          unit_points: number
          notes?: string
          subtotal_cash: number
          subtotal_points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          product_id?: string
          qty?: number
          unit_price?: number
          unit_points?: number
          notes?: string
          subtotal_cash?: number
          subtotal_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      stock_snapshots: {
        Row: {
          id: string
          product_id: string
          warehouse: string
          qty_available: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse: string
          qty_available: number
          last_updated: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse?: string
          qty_available?: number
          last_updated?: string
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          event_type: string
          actor_id: string
          role: string
          tenant_id: string
          target: string
          target_id?: string
          payload: any
          ip: string
          user_agent: string
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          actor_id: string
          role: string
          tenant_id: string
          target: string
          target_id?: string
          payload: any
          ip: string
          user_agent: string
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          actor_id?: string
          role?: string
          tenant_id?: string
          target?: string
          target_id?: string
          payload?: any
          ip?: string
          user_agent?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos para as funções do Supabase
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Tipos específicos
export type User = Tables<'users'>
export type Company = Tables<'companies'>
export type ProductBase = Tables<'products_base'>
export type Budget = Tables<'budgets'>
export type BudgetItem = Tables<'budget_items'>
export type StockSnapshot = Tables<'stock_snapshots'>
export type AuditLog = Tables<'audit_log'>

// Funções utilitárias
export const getSupabaseClient = () => supabase

export const getSupabaseAuth = () => supabase.auth

export const getSupabaseStorage = () => supabase.storage

export const getSupabaseRealtime = () => supabase.realtime

// Constantes
export const SUPABASE_CONSTANTS = {
  TABLES: {
    USERS: 'users',
    COMPANIES: 'companies',
    PRODUCTS_BASE: 'products_base',
    BUDGETS: 'budgets',
    BUDGET_ITEMS: 'budget_items',
    STOCK_SNAPSHOTS: 'stock_snapshots',
    AUDIT_LOG: 'audit_log',
  },
  ROLES: {
    ADMIN_GLOBAL: 'superadmin',
    MANAGER: 'manager',
    USER: 'user',
    LEITOR: 'leitor',
  },
  BUDGET_STATUSES: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  },
} as const
