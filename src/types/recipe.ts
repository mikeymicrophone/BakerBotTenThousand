// Recipe templating system types (preserved from BakeWatt innovations)

export interface FlexibleAmount {
  min: number
  max: number
  recommended: number
  step?: number
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  icon: string
}

export interface FlexibleIngredient {
  ingredient: Ingredient
  amount: number | FlexibleAmount
  hint?: string
}

export interface IngredientGroup {
  name: string
  ingredients: FlexibleIngredient[]
  description: string
}

export interface StepParameters {
  [key: string]: string | number
}

export interface RecipeStep {
  id: string
  name: string
  description: string
  order: number
  estimatedTime?: number
  temperature?: number
  instructions: string[] // With {parameter} and {group:name} substitution
  ingredients: FlexibleIngredient[]
  groups: IngredientGroup[]
  parameters: StepParameters
}

export interface RecipeTemplate {
  id: string
  name: string
  icon: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  baseServings: number
  estimatedTime: number
  steps: RecipeStep[]
  categories: string[]
}