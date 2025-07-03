// Supplier Panel - Lit component for purchasing ingredients
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'

@customElement('supplier-panel')
export class SupplierPanel extends ValtioLitElement {
  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
  }

  private buyIngredient(ingredient: string): void {
    gameState.revenue -= 2.99
    console.log(`Bought ${ingredient}`)
  }

  private goBack(): void {
    gameState.currentScreen = 'store'
  }

  private goToRecipes(): void {
    gameState.currentScreen = 'recipe-index'
  }

  render() {
    return html`
      <div class="ui-panel">
        <h2>🚚 Supplier</h2>
        <p>Purchase ingredients for your next recipe.</p>
        
        <div class="supplier-inventory">
          <div class="supplier-item">
            <h3>🌾 Flour</h3>
            <p>Price: $2.99/cup</p>
            <button @click=${() => this.buyIngredient('flour')}>Buy 5 cups</button>
          </div>
          
          <div class="supplier-item">
            <h3>🧂 Sugar</h3>
            <p>Price: $1.99/cup</p>
            <button @click=${() => this.buyIngredient('sugar')}>Buy 5 cups</button>
          </div>
        </div>
        
        <div class="button-group">
          <button @click=${this.goBack}>← Back</button>
          <button @click=${this.goToRecipes} class="btn-primary">Back to Recipes →</button>
        </div>
      </div>
    `
  }
}