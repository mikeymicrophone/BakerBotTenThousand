// Packaging Panel - Lit component with Three.js integration
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'
import { PackagingVisualizer } from '../lib/packaging-visualizer'

@customElement('packaging-panel')
export class PackagingPanel extends ValtioLitElement {
  private packagingViz: PackagingVisualizer | null = null

  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
    
    // Initialize Three.js visualization
    this.initializeVisualization()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.cleanupVisualization()
  }

  private async initializeVisualization(): Promise<void> {
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      if (this.packagingViz) {
        this.packagingViz.destroy()
      }
      this.packagingViz = new PackagingVisualizer('three-container')
    } catch (error) {
      console.error('Failed to initialize packaging visualization:', error)
    }
  }

  private cleanupVisualization(): void {
    if (this.packagingViz) {
      this.packagingViz.destroy()
      this.packagingViz = null
    }
  }

  private updatePiecesPerItem(event: Event): void {
    const target = event.target as HTMLInputElement
    gameState.packagingState.piecesPerItem = parseInt(target.value)
  }

  private updatePiecesPerParcel(event: Event): void {
    const target = event.target as HTMLInputElement
    gameState.packagingState.piecesPerParcel = parseInt(target.value)
  }

  private showBatch(): void {
    if (!this.packagingViz) return
    const recipe = gameState.selectedRecipe
    const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
    this.packagingViz.showBatch(totalItems)
  }

  private async animateDivision(): Promise<void> {
    if (!this.packagingViz) return
    const recipe = gameState.selectedRecipe
    const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
    await this.packagingViz.animateDivision(totalItems, gameState.packagingState.piecesPerItem)
  }

  private async animatePackaging(): Promise<void> {
    if (!this.packagingViz) return
    const recipe = gameState.selectedRecipe
    const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
    const totalPieces = totalItems * gameState.packagingState.piecesPerItem
    await this.packagingViz.animatePackaging(totalPieces, gameState.packagingState.piecesPerParcel)
  }

  private resetVisualization(): void {
    if (this.packagingViz) {
      this.packagingViz.clearVisualization()
    }
  }

  private goBack(): void {
    gameState.currentScreen = 'recipe-production'
  }

  private finishPackaging(): void {
    gameState.currentScreen = 'store'
  }

  render() {
    const recipe = gameState.selectedRecipe
    const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
    const currentPiecesPerItem = gameState.packagingState.piecesPerItem
    const currentPiecesPerParcel = gameState.packagingState.piecesPerParcel
    
    const totalPieces = totalItems * currentPiecesPerItem
    const totalParcels = Math.floor(totalPieces / currentPiecesPerParcel)
    const remainder = totalPieces % currentPiecesPerParcel
    
    return html`
      <div class="ui-panel">
        <h2>📦 Packaging Mathematics</h2>
        <p>Watch the math come alive as items are divided and packaged!</p>
        
        <div class="packaging-stats">
          <div class="stat-item">
            <span class="stat-label">Batch:</span>
            <span class="stat-value">${totalItems} ${totalItems === 1 ? 'item' : 'items'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total pieces:</span>
            <span class="stat-value">${totalPieces}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Parcels:</span>
            <span class="stat-value">${totalParcels}</span>
          </div>
          ${remainder > 0 ? html`
            <div class="stat-item remainder">
              <span class="stat-label">Remainder:</span>
              <span class="stat-value">${remainder}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="packaging-controls">
          <div class="slider-group">
            <label>Pieces per item:</label>
            <input 
              type="range" 
              min="6" 
              max="24" 
              .value=${currentPiecesPerItem.toString()}
              @input=${this.updatePiecesPerItem}
            />
            <span>${currentPiecesPerItem}</span>
          </div>
          
          <div class="slider-group">
            <label>Pieces per parcel:</label>
            <input 
              type="range" 
              min="2" 
              max="12" 
              .value=${currentPiecesPerParcel.toString()}
              @input=${this.updatePiecesPerParcel}
            />
            <span>${currentPiecesPerParcel}</span>
          </div>
        </div>
        
        <div class="math-equations">
          <div class="equation">
            <strong>Step 1:</strong> ${totalItems} items × ${currentPiecesPerItem} pieces/item = ${totalPieces} total pieces
          </div>
          <div class="equation">
            <strong>Step 2:</strong> ${totalPieces} pieces ÷ ${currentPiecesPerParcel} pieces/parcel = ${totalParcels} parcels${remainder > 0 ? ` + ${remainder} remainder` : ''}
          </div>
        </div>
        
        <div class="animation-controls">
          <button @click=${this.showBatch} class="btn-secondary">1. Show Batch</button>
          <button @click=${this.animateDivision} class="btn-secondary">2. Divide into Pieces</button>
          <button @click=${this.animatePackaging} class="btn-secondary">3. Package Parcels</button>
          <button @click=${this.resetVisualization} class="btn-secondary">🔄 Reset</button>
        </div>
        
        <div class="button-group">
          <button @click=${this.goBack}>← Back</button>
          <button @click=${this.finishPackaging} class="btn-primary">Finish Packaging →</button>
        </div>
      </div>
    `
  }
}