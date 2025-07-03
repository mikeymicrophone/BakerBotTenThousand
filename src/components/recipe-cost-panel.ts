// Recipe Cost Panel - Lit component for displaying recipe cost breakdown
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ValtioLitElement } from '../lib/valtio-lit';
import { gameState } from '../main';
import { CostEngine, CostBreakdown } from '../lib/cost-engine';
import type { ProcessedRecipe } from '../lib/recipe-engine';

@customElement('recipe-cost-panel')
export class RecipeCostPanel extends ValtioLitElement {
  private costBreakdown: CostBreakdown | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.subscribeToState(gameState);
  }
  
  updated(): void {
    if (gameState.selectedRecipe) {
      this.calculateCost(gameState.selectedRecipe);
    }
  }

  private calculateCost(recipe: ProcessedRecipe): void {
    this.costBreakdown = CostEngine.calculateRecipeCost(recipe);
    this.requestUpdate();
  }

  render() {
    if (!this.costBreakdown) {
      return html`<div class="ui-panel">Loading cost...</div>`;
    }

    return html`
      <div class="ui-panel">
        <h3>Cost Breakdown</h3>
        <div class="cost-summary">
          <span>Total Cost:</span>
          <span class="total-cost">$${this.costBreakdown.totalCost.toFixed(2)}</span>
        </div>
        <ul class="ingredient-costs">
          ${this.costBreakdown.ingredientCosts.map(
            item => html`
              <li>
                <span>${item.name}</span>
                <span>$${item.cost.toFixed(2)}</span>
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }
}
