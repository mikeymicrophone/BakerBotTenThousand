// App Shell - Main component that manages screen routing
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'

// Import all screen components
import './recipe-index-panel'
import './recipe-detail-panel'
import './recipe-production-panel'
import './packaging-panel'
import './store-panel'
import './supplier-panel'
import './recipe-cost-panel'

@customElement('app-shell')
export class AppShell extends ValtioLitElement {
  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
  }

  render() {
    // Route to different screen components based on current screen
    switch (gameState.currentScreen) {
      case 'recipe-index':
        return html`<recipe-index-panel></recipe-index-panel>`
      
      case 'recipe-detail':
        return html`
          <recipe-detail-panel></recipe-detail-panel>
          <recipe-cost-panel style="top: 20px; right: 20px; left: auto; width: 300px;"></recipe-cost-panel>
        `
      
      case 'recipe-production':
        return html`<recipe-production-panel></recipe-production-panel>`
      
      case 'packaging':
        return html`<packaging-panel></packaging-panel>`
      
      case 'store':
        return html`<store-panel></store-panel>`
      
      case 'supplier':
        return html`<supplier-panel></supplier-panel>`
      
      default:
        return html`<recipe-index-panel></recipe-index-panel>`
    }
  }
}