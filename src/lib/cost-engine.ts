// Costing Engine - Calculates recipe costs
import type { ProcessedRecipe, ProcessedIngredient } from './recipe-engine';

export interface CostBreakdown {
  totalCost: number;
  ingredientCosts: { name: string; cost: number }[];
}

export class CostEngine {
  /**
   * Calculate the total cost of a processed recipe.
   */
  static calculateRecipeCost(recipe: ProcessedRecipe): CostBreakdown {
    const ingredientCosts: { name: string; cost: number }[] = [];
    let totalCost = 0;

    recipe.steps.forEach(step => {
      step.ingredients.forEach(ingredient => {
        const cost = this.calculateIngredientCost(ingredient);
        if (cost > 0) {
          ingredientCosts.push({ name: ingredient.ingredient.name, cost });
          totalCost += cost;
        }
      });

      step.groups.forEach(group => {
        group.ingredients.forEach(ingredient => {
          const cost = this.calculateIngredientCost(ingredient);
          if (cost > 0) {
            ingredientCosts.push({ name: ingredient.ingredient.name, cost });
            totalCost += cost;
          }
        });
      });
    });

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      ingredientCosts,
    };
  }

  /**
   * Calculate the cost of a single processed ingredient.
   */
  private static calculateIngredientCost(ingredient: ProcessedIngredient): number {
    const costPerUnit = ingredient.ingredient.costPerUnit || 0;
    return ingredient.amount * costPerUnit;
  }
}
