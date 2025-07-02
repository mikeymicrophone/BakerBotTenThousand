// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe database interface matching our schema
export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string
          slug: string
          name: string
          unit: string
          icon: string | null
          category: string | null
          base_price: number | null
          nutrition_data: any | null
          storage_requirements: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          unit: string
          icon?: string | null
          category?: string | null
          base_price?: number | null
          nutrition_data?: any | null
          storage_requirements?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          unit?: string
          icon?: string | null
          category?: string | null
          base_price?: number | null
          nutrition_data?: any | null
          storage_requirements?: string[] | null
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          slug: string
          name: string
          icon: string | null
          category: string | null
          description: string | null
          base_cost: number | null
          unlock_level: number | null
          efficiency_bonus: number | null
          created_at: string
        }
      }
      masters: {
        Row: {
          id: string
          slug: string
          name: string
          avatar: string | null
          specialty: string
          bio: string | null
          unlock_requirements: any | null
          created_at: string
        }
      }
      techniques: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          master_id: string | null
          category: string | null
          difficulty_level: number | null
          learning_curve: any | null
          benefits: any | null
          tutorial_steps: string[] | null
          created_at: string
        }
      }
      recipe_templates: {
        Row: {
          id: string
          slug: string
          name: string
          icon: string | null
          description: string | null
          difficulty: string | null
          base_servings: number
          estimated_time_minutes: number | null
          categories: string[] | null
          unlock_requirements: any | null
          nutrition_profile: any | null
          created_at: string
        }
      }
      recipe_steps: {
        Row: {
          id: string
          recipe_id: string
          step_order: number
          step_type: string
          name: string
          description: string | null
          instructions: any
          parameters: any | null
          estimated_time_minutes: number | null
          temperature_f: number | null
          required_equipment: string[] | null
          optional_equipment: string[] | null
          required_techniques: string[] | null
          technique_impact: any | null
          created_at: string
        }
      }
      recipe_step_ingredients: {
        Row: {
          id: string
          step_id: string
          ingredient_id: string
          amount_type: string | null
          fixed_amount: number | null
          min_amount: number | null
          max_amount: number | null
          recommended_amount: number | null
          step_size: number | null
          customization_hint: string | null
          group_name: string | null
          created_at: string
        }
      }
    }
  }
}