// Recipe Index Panel - Lit component for recipe selection
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ValtioLitElement } from '../lib/valtio-lit'
import { gameState } from '../main'
import { RECIPE_TEMPLATES } from '../data/recipe-templates'
import { RecipeLoader } from '../lib/recipe-loader'
import type { RecipeTemplate } from '../types/recipe'

@customElement('recipe-index-panel')
export class RecipeIndexPanel extends ValtioLitElement {
  private supabaseRecipes: RecipeTemplate[] = []
  private loading = false

  connectedCallback(): void {
    super.connectedCallback()
    this.subscribeToState(gameState)
    this.loadRecipes()
  }

  private async loadRecipes(): Promise<void> {
    try {
      this.loading = true
      this.requestUpdate()
      const recipes = await RecipeLoader.loadRecipeTemplates()
      this.supabaseRecipes = recipes
      this.requestUpdate()
    } catch (error) {
      console.log('Using local recipes (Supabase unavailable)')
    } finally {
      this.loading = false
      this.requestUpdate()
    }
  }

  private async selectRecipe(recipeId: string): Promise<void> {
    // Try to find recipe in Supabase data first
    let template: RecipeTemplate | null | undefined = this.supabaseRecipes.find(r => r.id === recipeId)
    
    // Fallback to hardcoded recipes
    if (!template) {
      template = RECIPE_TEMPLATES[recipeId.toUpperCase().replace('-', '_')]
    }
    
    // If still not found, try loading from Supabase
    if (!template) {
      template = await RecipeLoader.loadFullRecipe(recipeId)
    }

    if (template && template.unstartable) {
      console.log(`Recipe "${template.name}" cannot be started.`, template.notes ? `Reason: ${template.notes}`: '');
      // In a real app, we might show a user-friendly notification here.
      return;
    }
    
    if (template) {
      // Import RecipeEngine dynamically to avoid circular dependencies
      const { RecipeEngine } = await import('../lib/recipe-engine')
      gameState.selectedRecipeId = recipeId
      gameState.selectedRecipe = RecipeEngine.processRecipe(template, gameState.scaleFactor)
      gameState.currentStepIndex = 0
      gameState.currentScreen = 'recipe-detail'
    } else {
      console.error('Recipe not found:', recipeId)
    }
  }

  private async reloadFromSupabase(): Promise<void> {
    await this.loadRecipes()
    this.requestUpdate()
  }

  render() {
    const recipes: RecipeTemplate[] = this.supabaseRecipes.length > 0 ? this.supabaseRecipes : Object.values(RECIPE_TEMPLATES)
    
    return html`
      <div class="ui-panel">
        <h2>📚 Recipe Collection</h2>
        <p>Choose a recipe to start baking!</p>
        
        <small style="color: #ffc107; margin-bottom: 15px; display: block;">
          ${this.supabaseRecipes.length > 0 ? '🌐 Loaded from Supabase' : '💾 Using local data'}
          ${this.loading ? ' (Loading...)' : ''}
        </small>
        
        <div class="recipe-grid">
          ${recipes.map(recipe => html`
            <div 
              class="recipe-card ${recipe.unstartable ? 'unstartable' : ''}" 
              @click=${() => this.selectRecipe(recipe.id)}
              title=${recipe.unstartable && recipe.notes ? recipe.notes : ''}
            >
              <div class="recipe-icon">${recipe.icon}</div>
              <h3>${recipe.name}</h3>
              <p>${recipe.difficulty} • ${recipe.estimatedTime} min</p>
              <small>${recipe.description}</small>
              ${recipe.unstartable ? html`<div class="unstartable-banner">Not Available</div>` : ''}
            </div>
          `)}
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
          <button @click=${this.reloadFromSupabase} style="font-size: 12px; padding: 8px 12px;" ?disabled=${this.loading}>
            🔄 Reload from Supabase
          </button>
        </div>
      </div>
    `
  }
}
