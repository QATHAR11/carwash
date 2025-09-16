import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'staff'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'staff'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'staff'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          service_id: string
          staff_id: string
          amount: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          staff_id: string
          amount: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          staff_id?: string
          amount?: number
          date?: string
          created_at?: string
        }
      }
    }
  }
}