// Recipe data loader from Supabase
import { supabase } from './supabase'
import type { RecipeTemplate, RecipeStep, FlexibleIngredient, IngredientGroup, Ingredient } from '../types/recipe'

export class RecipeLoader {
  private static recipeCache = new Map<string, RecipeTemplate>()
  private static ingredientCache = new Map<string, Ingredient>()

  /**
   * Load all recipe templates from Supabase
   */
  static async loadRecipeTemplates(): Promise<RecipeTemplate[]> {
    try {
      const { data: recipes, error } = await supabase
        .from('recipe_templates')
        .select('*')
        .order('name')

      if (error) throw error

      const templates: RecipeTemplate[] = []

      for (const recipe of recipes || []) {
        const template = await this.loadFullRecipe(recipe.slug)
        if (template) {
          templates.push(template)
        }
      }

      return templates
    } catch (error) {
      console.error('Error loading recipe templates:', error)
      return []
    }
  }

  /**
   * Load a complete recipe with steps and ingredients
   */
  static async loadFullRecipe(slug: string): Promise<RecipeTemplate | null> {
    // Check cache first
    if (this.recipeCache.has(slug)) {
      return this.recipeCache.get(slug)!
    }

    try {
      // Load recipe template
      const { data: recipe, error: recipeError } = await supabase
        .from('recipe_templates')
        .select('*')
        .eq('slug', slug)
        .single()

      if (recipeError || !recipe) {
        console.error('Recipe not found:', slug, recipeError)
        return null
      }

      // Load recipe steps with ingredients
      const { data: steps, error: stepsError } = await supabase
        .from('recipe_steps')
        .select(`
          *,
          recipe_step_ingredients (
            *,
            ingredients (*)
          )
        `)
        .eq('recipe_id', recipe.id)
        .order('step_order')

      if (stepsError) {
        console.error('Error loading recipe steps:', stepsError)
        return null
      }

      // Transform database format to our RecipeTemplate type
      const template: RecipeTemplate = {
        id: recipe.slug,
        name: recipe.name,
        icon: recipe.icon || '🍽️',
        description: recipe.description || '',
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        baseServings: recipe.base_servings,
        estimatedTime: recipe.estimated_time_minutes || 60,
        categories: recipe.categories || [],
        steps: await this.transformSteps(steps || [])
      }

      // Cache the result
      this.recipeCache.set(slug, template)
      return template

    } catch (error) {
      console.error('Error loading full recipe:', error)
      return null
    }
  }

  /**
   * Transform database steps to our RecipeStep format
   */
  private static async transformSteps(dbSteps: any[]): Promise<RecipeStep[]> {
    const steps: RecipeStep[] = []

    for (const dbStep of dbSteps) {
      // Group ingredients by group_name
      const ingredientGroups = new Map<string, FlexibleIngredient[]>()
      const stepIngredients: FlexibleIngredient[] = []

      for (const dbIngredient of dbStep.recipe_step_ingredients || []) {
        const ingredient = await this.getIngredient(dbIngredient.ingredients.slug)
        if (!ingredient) continue

        const flexIngredient: FlexibleIngredient = {
          ingredient,
          amount: dbIngredient.amount_type === 'flexible' 
            ? {
                min: dbIngredient.min_amount || 0,
                max: dbIngredient.max_amount || 1,
                recommended: dbIngredient.recommended_amount || 0.5,
                step: dbIngredient.step_size || 0.1
              }
            : dbIngredient.fixed_amount || 1,
          hint: dbIngredient.customization_hint || undefined
        }

        if (dbIngredient.group_name) {
          if (!ingredientGroups.has(dbIngredient.group_name)) {
            ingredientGroups.set(dbIngredient.group_name, [])
          }
          ingredientGroups.get(dbIngredient.group_name)!.push(flexIngredient)
        } else {
          stepIngredients.push(flexIngredient)
        }
      }

      // Convert groups to IngredientGroup format
      const groups: IngredientGroup[] = Array.from(ingredientGroups.entries()).map(([name, ingredients]) => ({
        name,
        ingredients,
        description: this.getGroupDescription(name)
      }))

      const step: RecipeStep = {
        id: dbStep.id,
        name: dbStep.name,
        description: dbStep.description || '',
        order: dbStep.step_order,
        estimatedTime: dbStep.estimated_time_minutes,
        temperature: dbStep.temperature_f,
        instructions: Array.isArray(dbStep.instructions) ? dbStep.instructions : [dbStep.instructions],
        ingredients: stepIngredients,
        groups,
        parameters: dbStep.parameters || {}
      }

      steps.push(step)
    }

    return steps
  }

  /**
   * Get ingredient by slug (with caching)
   */
  private static async getIngredient(slug: string): Promise<Ingredient | null> {
    if (this.ingredientCache.has(slug)) {
      return this.ingredientCache.get(slug)!
    }

    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) return null

      const ingredient: Ingredient = {
        id: data.slug,
        name: data.name,
        unit: data.unit,
        icon: data.icon || '🥄'
      }

      this.ingredientCache.set(slug, ingredient)
      return ingredient

    } catch (error) {
      console.error('Error loading ingredient:', slug, error)
      return null
    }
  }

  /**
   * Get human-readable group descriptions
   */
  private static getGroupDescription(groupName: string): string {
    const descriptions: Record<string, string> = {
      'dry': 'Dry base ingredients',
      'wet': 'Liquid ingredients',
      'fats': 'Fat ingredients for creaming',
      'mixins': 'Mix-in ingredients'
    }
    return descriptions[groupName] || `${groupName} ingredients`
  }

  /**
   * Clear cache (useful for development)
   */
  static clearCache(): void {
    this.recipeCache.clear()
    this.ingredientCache.clear()
  }
}