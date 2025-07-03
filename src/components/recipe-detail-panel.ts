// Recipe Detail Panel - Lit component for recipe details and scaling
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'

@customElement('recipe-detail-panel')
export class RecipeDetailPanel extends ValtioLitElement {
  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
  }

  private formatAmount(amount: number): string {
    const fractions: Record<string, string> = {
      '0.25': '¼', '0.33': '⅓', '0.5': '½', '0.67': '⅔', '0.75': '¾'
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

  private async scaleRecipe(factor: number): Promise<void> {
    if (gameState.selectedRecipeId && gameState.selectedRecipe) {
      gameState.scaleFactor = Math.max(0.5, Math.min(4, gameState.scaleFactor * factor))
      
      // For now, we'll trigger a re-selection which will reprocess the recipe
      // This is a simplified approach - in a full implementation we'd store the original template
      const selectedId = gameState.selectedRecipeId
      gameState.selectedRecipeId = null
      gameState.selectedRecipeId = selectedId
      
      this.requestUpdate()
    }
  }

  private goBack(): void {
    gameState.currentScreen = 'recipe-index'
  }

  private startCooking(): void {
    gameState.currentScreen = 'recipe-production'
  }

  render() {
    if (!gameState.selectedRecipe) {
      return html`<div class="ui-panel">Loading...</div>`
    }
    
    const recipe = gameState.selectedRecipe
    const allIngredients = recipe.steps.flatMap(step => 
      [...step.ingredients, ...step.groups.flatMap(g => g.ingredients)]
    )

    return html`
      <div class="ui-panel">
        <h2>${recipe.icon} ${recipe.name}</h2>
        <p>${recipe.description}</p>
        
        <div class="recipe-info">
          <div class="recipe-stats">
            <span><strong>Servings:</strong> ${recipe.servings}</span>
            <span><strong>Time:</strong> ${recipe.estimatedTime} min</span>
            <span><strong>Difficulty:</strong> ${recipe.difficulty}</span>
          </div>
          
          <div class="scaling-controls">
            <h4>Recipe Scaling:</h4>
            <div class="scaling-buttons">
              <button @click=${() => this.scaleRecipe(0.5)} ?disabled=${gameState.scaleFactor <= 0.5}>½×</button>
              <span class="scale-display">${gameState.scaleFactor}× (${recipe.servings} servings)</span>
              <button @click=${() => this.scaleRecipe(2)} ?disabled=${gameState.scaleFactor >= 4}>2×</button>
            </div>
          </div>
          
          <div class="ingredients-summary">
            <h4>All Ingredients Needed:</h4>
            <ul>
              ${allIngredients.map(ing => html`
                <li>
                  ${ing.ingredient.icon} ${ing.ingredient.name}: 
                  <strong>${this.formatAmount(ing.amount)} ${ing.ingredient.unit}</strong>
                  ${ing.hint ? html`<small class="hint">${ing.hint}</small>` : ''}
                </li>
              `)}
            </ul>
          </div>
        </div>
        
        <div class="button-group">
          <button @click=${this.goBack}>← Back</button>
          <button @click=${this.startCooking} class="btn-primary">Start Cooking →</button>
        </div>
      </div>
    `
  }
}