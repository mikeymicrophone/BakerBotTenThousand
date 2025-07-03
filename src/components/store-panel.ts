// Store Panel - Lit component for selling packaged goods
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'

@customElement('store-panel')
export class StorePanel extends ValtioLitElement {
  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
  }

  private sellPackage(): void {
    gameState.revenue += 5.99
  }

  private goBack(): void {
    gameState.currentScreen = 'packaging'
  }

  private goToSupplier(): void {
    gameState.currentScreen = 'supplier'
  }

  render() {
    return html`
      <div class="ui-panel">
        <h2>🏪 Store</h2>
        <p>Sell your packaged goods!</p>
        
        <div class="store-inventory">
          <div class="store-item">
            <h3>🍪 Cookie Package (4 cookies)</h3>
            <p>Price: $5.99</p>
            <button @click=${this.sellPackage} class="btn-sell">Sell Package</button>
          </div>
        </div>
        
        <div class="store-stats">
          <p>Revenue: $${gameState.revenue}</p>
        </div>
        
        <div class="button-group">
          <button @click=${this.goBack}>← Back</button>
          <button @click=${this.goToSupplier} class="btn-primary">Buy Ingredients →</button>
        </div>
      </div>
    `
  }
}