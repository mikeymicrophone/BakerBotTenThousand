// Recipe templating engine with parameter injection (BakeWatt innovation)
import type { RecipeTemplate, RecipeStep, IngredientGroup, FlexibleIngredient, StepParameters } from '../types/recipe'

export class RecipeEngine {
  /**
   * Process a recipe template with scaling factor
   */
  static processRecipe(template: RecipeTemplate, scaleFactor: number = 1.0): ProcessedRecipe {
    return {
      ...template,
      servings: Math.round(template.baseServings * scaleFactor),
      scaleFactor,
      steps: template.steps.map(step => this.processStep(step, scaleFactor))
    }
  }

  /**
   * Process a single recipe step with parameter injection
   */
  static processStep(step: RecipeStep, scaleFactor: number = 1.0): ProcessedStep {
    const scaledIngredients = this.scaleIngredients(step.ingredients, scaleFactor)
    const scaledGroups = this.scaleGroups(step.groups, scaleFactor)
    const processedInstructions = this.injectParameters(step.instructions, step.parameters, scaledGroups)

    return {
      ...step,
      ingredients: scaledIngredients,
      groups: scaledGroups,
      instructions: processedInstructions,
      estimatedTime: step.estimatedTime ? Math.ceil(step.estimatedTime * Math.sqrt(scaleFactor)) : undefined
    }
  }

  /**
   * Inject parameters and group references into instruction templates
   */
  static injectParameters(instructions: string[], parameters: StepParameters, groups: ProcessedGroup[]): string[] {
    return instructions.map(instruction => {
      let processed = instruction

      // Replace {parameter} placeholders
      Object.entries(parameters).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        processed = processed.replace(regex, String(value))
      })

      // Replace {group:name} placeholders
      groups.forEach(group => {
        const regex = new RegExp(`\\{group:${group.name}\\}`, 'g')
        const ingredientList = this.formatIngredientList(group.ingredients)
        processed = processed.replace(regex, ingredientList)
      })

      return processed
    })
  }

  /**
   * Format ingredient list for instruction text
   */
  static formatIngredientList(ingredients: ProcessedIngredient[]): string {
    if (ingredients.length === 0) return ''
    if (ingredients.length === 1) {
      const ing = ingredients[0]
      return `${this.formatAmount(ing.amount)} ${ing.ingredient.unit} ${ing.ingredient.name.toLowerCase()}`
    }

    const formatted = ingredients.map(ing => 
      `${this.formatAmount(ing.amount)} ${ing.ingredient.unit} ${ing.ingredient.name.toLowerCase()}`
    )

    if (formatted.length === 2) {
      return `${formatted[0]} and ${formatted[1]}`
    }

    const last = formatted.pop()
    return `${formatted.join(', ')}, and ${last}`
  }

  /**
   * Format amount for display (handles decimals nicely)
   */
  static formatAmount(amount: number): string {
    // Convert decimals to fractions for common cooking amounts
    const fractions: Record<string, string> = {
      '0.25': '¼',
      '0.33': '⅓',
      '0.5': '½',
      '0.67': '⅔',
      '0.75': '¾'
    }

    const decimal = amount % 1
    const whole = Math.floor(amount)
    
    if (decimal === 0) return String(whole)
    
    const decimalStr = decimal.toFixed(2)
    if (fractions[decimalStr]) {
      return whole > 0 ? `${whole} ${fractions[decimalStr]}` : fractions[decimalStr]
    }
    
    return amount.toString()
  }

  /**
   * Scale ingredients by factor
   */
  static scaleIngredients(ingredients: FlexibleIngredient[], scaleFactor: number): ProcessedIngredient[] {
    return ingredients.map(ing => ({
      ...ing,
      amount: this.scaleAmount(ing.amount, scaleFactor)
    }))
  }

  /**
   * Scale ingredient groups
   */
  static scaleGroups(groups: IngredientGroup[], scaleFactor: number): ProcessedGroup[] {
    return groups.map(group => ({
      ...group,
      ingredients: this.scaleIngredients(group.ingredients, scaleFactor)
    }))
  }

  /**
   * Scale a flexible amount (number or range)
   */
  static scaleAmount(amount: number | { min: number, max: number, recommended: number }, scaleFactor: number): number {
    if (typeof amount === 'number') {
      return Number((amount * scaleFactor).toFixed(3))
    }
    
    // For flexible amounts, scale the recommended value
    return Number((amount.recommended * scaleFactor).toFixed(3))
  }

  /**
   * Get the range for a flexible ingredient (for UI)
   */
  static getAmountRange(amount: number | { min: number, max: number, recommended: number }, scaleFactor: number = 1.0) {
    if (typeof amount === 'number') {
      const scaled = amount * scaleFactor
      return { min: scaled, max: scaled, recommended: scaled, isFixed: true }
    }
    
    return {
      min: Number((amount.min * scaleFactor).toFixed(3)),
      max: Number((amount.max * scaleFactor).toFixed(3)),
      recommended: Number((amount.recommended * scaleFactor).toFixed(3)),
      isFixed: false
    }
  }
}

// Processed types
export interface ProcessedRecipe extends Omit<RecipeTemplate, 'steps' | 'baseServings'> {
  servings: number
  scaleFactor: number
  steps: ProcessedStep[]
}

export interface ProcessedStep extends Omit<RecipeStep, 'instructions' | 'ingredients' | 'groups'> {
  instructions: string[]
  ingredients: ProcessedIngredient[]
  groups: ProcessedGroup[]
}

export interface ProcessedIngredient extends Omit<FlexibleIngredient, 'amount'> {
  amount: number
}

export interface ProcessedGroup extends Omit<IngredientGroup, 'ingredients'> {
  ingredients: ProcessedIngredient[]
}