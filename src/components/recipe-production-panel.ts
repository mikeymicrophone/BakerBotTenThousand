// Recipe Production Panel - Lit component for cooking steps
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'

@customElement('recipe-production-panel')
export class RecipeProductionPanel extends ValtioLitElement {
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

  private transferIngredient(ingredient: string, amount: number): void {
    console.log(`Transferred ${this.formatAmount(amount)} ${ingredient} to counter`)
    
    // Update counter ingredients
    const current = gameState.counterIngredients.get(ingredient) || 0
    gameState.counterIngredients.set(ingredient, current + amount)
  }

  private goBack(): void {
    gameState.currentScreen = 'recipe-detail'
  }

  private nextStep(): void {
    gameState.currentStepIndex++
  }

  private proceedToPackaging(): void {
    gameState.currentScreen = 'packaging'
  }

  render() {
    if (!gameState.selectedRecipe) {
      return html`<div class="ui-panel">Loading...</div>`
    }
    
    const recipe = gameState.selectedRecipe
    const currentStep = recipe.steps[gameState.currentStepIndex]
    const isLastStep = gameState.currentStepIndex >= recipe.steps.length - 1
    
    if (!currentStep) {
      return html`
        <div class="ui-panel">
          <h2>🎉 Recipe Complete!</h2>
          <p>You've finished all the steps for ${recipe.name}!</p>
          
          <div class="button-group">
            <button @click=${this.goBack}>← Back</button>
            <button @click=${this.proceedToPackaging} class="btn-primary">Proceed to Packaging →</button>
          </div>
        </div>
      `
    }
    
    return html`
      <div class="ui-panel">
        <h2>🔥 ${recipe.name} - Step ${gameState.currentStepIndex + 1}</h2>
        <div class="step-progress">
          <span>Step ${gameState.currentStepIndex + 1} of ${recipe.steps.length}</span>
        </div>
        
        <div class="cooking-step">
          <h3>${currentStep.name}</h3>
          <p>${currentStep.description}</p>
          
          ${currentStep.estimatedTime ? html`<div class="time-estimate">⏱️ ${currentStep.estimatedTime} minutes</div>` : ''}
          ${currentStep.temperature ? html`<div class="temperature">🌡️ ${currentStep.temperature}°F</div>` : ''}
          
          <div class="instructions">
            <h4>Instructions:</h4>
            <ol>
              ${currentStep.instructions.map(instruction => html`<li>${instruction}</li>`)}
            </ol>
          </div>
          
          ${currentStep.ingredients.length > 0 || currentStep.groups.length > 0 ? html`
            <div class="ingredient-zones">
              <h4>Ingredients for this step:</h4>
              ${currentStep.ingredients.map(ing => html`
                <div class="ingredient-card">
                  <span>${ing.ingredient.icon} ${ing.ingredient.name}: ${this.formatAmount(ing.amount)} ${ing.ingredient.unit}</span>
                  <button @click=${() => this.transferIngredient(ing.ingredient.id, ing.amount)}>Transfer</button>
                </div>
              `)}
              
              ${currentStep.groups.map(group => html`
                <div class="ingredient-group">
                  <h5>${group.description}:</h5>
                  ${group.ingredients.map(ing => html`
                    <div class="ingredient-card">
                      <span>${ing.ingredient.icon} ${ing.ingredient.name}: ${this.formatAmount(ing.amount)} ${ing.ingredient.unit}</span>
                      <button @click=${() => this.transferIngredient(ing.ingredient.id, ing.amount)}>Transfer</button>
                    </div>
                  `)}
                </div>
              `)}
            </div>
          ` : ''}
        </div>
        
        <div class="button-group">
          <button @click=${this.goBack}>← Back</button>
          <button @click=${isLastStep ? this.proceedToPackaging : this.nextStep} class="btn-primary">
            ${isLastStep ? 'Proceed to Packaging' : 'Next Step'} →
          </button>
        </div>
      </div>
    `
  }
}