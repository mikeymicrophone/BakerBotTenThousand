import { proxy } from 'valtio'
import './style.css'
import { RECIPE_TEMPLATES } from './data/recipe-templates'
import { RecipeEngine, type ProcessedRecipe } from './lib/recipe-engine'
import { RecipeLoader } from './lib/recipe-loader'
import { PackagingVisualizer } from './lib/packaging-visualizer'

// Global state for Supabase recipes
let supabaseRecipes: any[] = []

// Three.js visualizer instance
let packagingViz: PackagingVisualizer | null = null

// Simple game state with Valtio
export const gameState = proxy({
  currentScreen: 'recipe-index' as 'recipe-index' | 'recipe-detail' | 'recipe-production' | 'packaging' | 'store' | 'supplier',
  selectedRecipeId: null as string | null,
  selectedRecipe: null as ProcessedRecipe | null,
  scaleFactor: 1.0,
  currentStepIndex: 0,
  pantryIngredients: new Map<string, number>(),
  counterIngredients: new Map<string, number>(),
  packages: [],
  revenue: 100, // Start with some money
  packagingState: {
    piecesPerItem: 12,
    piecesPerParcel: 4
  }
})

// Screen components
const screens = {
  'recipe-index': () => {
    // Use Supabase recipes if available, fallback to hardcoded
    const recipes = supabaseRecipes.length > 0 ? supabaseRecipes : Object.values(RECIPE_TEMPLATES)
    
    return `
      <div class="ui-panel">
        <h2>📚 Recipe Collection</h2>
        <p>Choose a recipe to start baking!</p>
        <small style="color: #ffc107; margin-bottom: 15px; display: block;">
          ${supabaseRecipes.length > 0 ? '🌐 Loaded from Supabase' : '💾 Using local data'}
        </small>
        
        <div class="recipe-grid">
          ${recipes.map(recipe => `
            <div class="recipe-card" onclick="selectRecipe('${recipe.id}')">
              <div class="recipe-icon">${recipe.icon}</div>
              <h3>${recipe.name}</h3>
              <p>${recipe.difficulty} • ${recipe.estimatedTime} min</p>
              <small>${recipe.description}</small>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
          <button onclick="loadSupabaseRecipes()" style="font-size: 12px; padding: 8px 12px;">
            🔄 Reload from Supabase
          </button>
        </div>
      </div>
    `
  },
  
  'recipe-detail': () => {
    if (!gameState.selectedRecipe) return '<div class="ui-panel">Loading...</div>'
    
    const recipe = gameState.selectedRecipe
    const allIngredients = recipe.steps.flatMap(step => [...step.ingredients, ...step.groups.flatMap(g => g.ingredients)])
    
    return `
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
              <button onclick="scaleRecipe(0.5)" ${gameState.scaleFactor <= 0.5 ? 'disabled' : ''}>½×</button>
              <span class="scale-display">${gameState.scaleFactor}× (${recipe.servings} servings)</span>
              <button onclick="scaleRecipe(2)" ${gameState.scaleFactor >= 4 ? 'disabled' : ''}>2×</button>
            </div>
          </div>
          
          <div class="ingredients-summary">
            <h4>All Ingredients Needed:</h4>
            <ul>
              ${allIngredients.map(ing => `
                <li>
                  ${ing.ingredient.icon} ${ing.ingredient.name}: 
                  <strong>${RecipeEngine.formatAmount(ing.amount)} ${ing.ingredient.unit}</strong>
                  ${ing.hint ? `<small class="hint">${ing.hint}</small>` : ''}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
        
        <div class="button-group">
          <button onclick="goBack()">← Back</button>
          <button onclick="startCooking()" class="btn-primary">Start Cooking →</button>
        </div>
      </div>
    `
  },
  
  'recipe-production': () => {
    if (!gameState.selectedRecipe) return '<div class="ui-panel">Loading...</div>'
    
    const recipe = gameState.selectedRecipe
    const currentStep = recipe.steps[gameState.currentStepIndex]
    const isLastStep = gameState.currentStepIndex >= recipe.steps.length - 1
    
    if (!currentStep) {
      return `
        <div class="ui-panel">
          <h2>🎉 Recipe Complete!</h2>
          <p>You've finished all the steps for ${recipe.name}!</p>
          
          <div class="button-group">
            <button onclick="goBack()">← Back</button>
            <button onclick="proceedToPackaging()" class="btn-primary">Proceed to Packaging →</button>
          </div>
        </div>
      `
    }
    
    return `
      <div class="ui-panel">
        <h2>🔥 ${recipe.name} - Step ${gameState.currentStepIndex + 1}</h2>
        <div class="step-progress">
          <span>Step ${gameState.currentStepIndex + 1} of ${recipe.steps.length}</span>
        </div>
        
        <div class="cooking-step">
          <h3>${currentStep.name}</h3>
          <p>${currentStep.description}</p>
          
          ${currentStep.estimatedTime ? `<div class="time-estimate">⏱️ ${currentStep.estimatedTime} minutes</div>` : ''}
          ${currentStep.temperature ? `<div class="temperature">🌡️ ${currentStep.temperature}°F</div>` : ''}
          
          <div class="instructions">
            <h4>Instructions:</h4>
            <ol>
              ${currentStep.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>
          
          ${currentStep.ingredients.length > 0 || currentStep.groups.length > 0 ? `
            <div class="ingredient-zones">
              <h4>Ingredients for this step:</h4>
              ${currentStep.ingredients.map(ing => `
                <div class="ingredient-card">
                  <span>${ing.ingredient.icon} ${ing.ingredient.name}: ${RecipeEngine.formatAmount(ing.amount)} ${ing.ingredient.unit}</span>
                  <button onclick="transferIngredient('${ing.ingredient.id}', ${ing.amount})">Transfer</button>
                </div>
              `).join('')}
              
              ${currentStep.groups.map(group => `
                <div class="ingredient-group">
                  <h5>${group.description}:</h5>
                  ${group.ingredients.map(ing => `
                    <div class="ingredient-card">
                      <span>${ing.ingredient.icon} ${ing.ingredient.name}: ${RecipeEngine.formatAmount(ing.amount)} ${ing.ingredient.unit}</span>
                      <button onclick="transferIngredient('${ing.ingredient.id}', ${ing.amount})">Transfer</button>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="button-group">
          <button onclick="goBack()">← Back</button>
          <button onclick="${isLastStep ? 'proceedToPackaging' : 'nextStep'}()" class="btn-primary">
            ${isLastStep ? 'Proceed to Packaging' : 'Next Step'} →
          </button>
        </div>
      </div>
    `
  },
  
  'packaging': () => {
    const recipe = gameState.selectedRecipe
    const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2 // Simplified: assume 2 cookies made
    const currentPiecesPerItem = gameState.packagingState?.piecesPerItem || 12
    const currentPiecesPerParcel = gameState.packagingState?.piecesPerParcel || 4
    
    const totalPieces = totalItems * currentPiecesPerItem
    const totalParcels = Math.floor(totalPieces / currentPiecesPerParcel)
    const remainder = totalPieces % currentPiecesPerParcel
    
    return `
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
          ${remainder > 0 ? `<div class="stat-item remainder"><span class="stat-label">Remainder:</span><span class="stat-value">${remainder}</span></div>` : ''}
        </div>
        
        <div class="packaging-controls">
          <div class="slider-group">
            <label>Pieces per item:</label>
            <input type="range" min="6" max="24" value="${currentPiecesPerItem}" 
                   onchange="updatePiecesPerItem(this.value)" />
            <span id="pieces-per-item-value">${currentPiecesPerItem}</span>
          </div>
          
          <div class="slider-group">
            <label>Pieces per parcel:</label>
            <input type="range" min="2" max="12" value="${currentPiecesPerParcel}" 
                   onchange="updatePiecesPerParcel(this.value)" />
            <span id="pieces-per-parcel-value">${currentPiecesPerParcel}</span>
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
          <button onclick="showBatch()" class="btn-secondary">1. Show Batch</button>
          <button onclick="animateDivision()" class="btn-secondary">2. Divide into Pieces</button>
          <button onclick="animatePackaging()" class="btn-secondary">3. Package Parcels</button>
          <button onclick="resetPackagingViz()" class="btn-secondary">🔄 Reset</button>
        </div>
        
        <div class="button-group">
          <button onclick="goBack()">← Back</button>
          <button onclick="finishPackaging()" class="btn-primary">Finish Packaging →</button>
        </div>
      </div>
    `
  },
  
  'store': () => `
    <div class="ui-panel">
      <h2>🏪 Store</h2>
      <p>Sell your packaged goods!</p>
      
      <div class="store-inventory">
        <div class="store-item">
          <h3>🍪 Cookie Package (4 cookies)</h3>
          <p>Price: $5.99</p>
          <button onclick="sellPackage()" class="btn-sell">Sell Package</button>
        </div>
      </div>
      
      <div class="store-stats">
        <p>Revenue: $${gameState.revenue}</p>
      </div>
      
      <div class="button-group">
        <button onclick="goBack()">← Back</button>
        <button onclick="goToSupplier()" class="btn-primary">Buy Ingredients →</button>
      </div>
    </div>
  `,
  
  'supplier': () => `
    <div class="ui-panel">
      <h2>🚚 Supplier</h2>
      <p>Purchase ingredients for your next recipe.</p>
      
      <div class="supplier-inventory">
        <div class="supplier-item">
          <h3>🌾 Flour</h3>
          <p>Price: $2.99/cup</p>
          <button onclick="buyIngredient('flour')">Buy 5 cups</button>
        </div>
        
        <div class="supplier-item">
          <h3>🧂 Sugar</h3>
          <p>Price: $1.99/cup</p>
          <button onclick="buyIngredient('sugar')">Buy 5 cups</button>
        </div>
      </div>
      
      <div class="button-group">
        <button onclick="goBack()">← Back</button>
        <button onclick="goToRecipes()" class="btn-primary">Back to Recipes →</button>
      </div>
    </div>
  `
}

// Navigation functions (global for onclick handlers)
declare global {
  interface Window {
    selectRecipe: (recipeId: string) => void
    scaleRecipe: (factor: number) => void
    startCooking: () => void
    nextStep: () => void
    transferIngredient: (ingredient: string, amount?: number) => void
    proceedToPackaging: () => void
    finishPackaging: () => void
    sellPackage: () => void
    buyIngredient: (ingredient: string) => void
    goToSupplier: () => void
    goToRecipes: () => void
    goBack: () => void
    loadSupabaseRecipes: () => void
    
    // Packaging visualization functions
    updatePiecesPerItem: (value: string) => void
    updatePiecesPerParcel: (value: string) => void
    showBatch: () => void
    animateDivision: () => void
    animatePackaging: () => void
    resetPackagingViz: () => void
  }
}

// Load Supabase recipes
window.loadSupabaseRecipes = async () => {
  try {
    console.log('Loading recipes from Supabase...')
    const recipes = await RecipeLoader.loadRecipeTemplates()
    supabaseRecipes = recipes
    console.log(`Loaded ${recipes.length} recipes from Supabase`)
    render()
  } catch (error) {
    console.error('Failed to load recipes from Supabase:', error)
  }
}

window.selectRecipe = async (recipeId: string) => {
  // Try to find recipe in Supabase data first
  let template = supabaseRecipes.find(r => r.id === recipeId)
  
  // Fallback to hardcoded recipes
  if (!template) {
    template = RECIPE_TEMPLATES[recipeId.toUpperCase().replace('-', '_')]
  }
  
  // If still not found, try loading from Supabase
  if (!template) {
    template = await RecipeLoader.loadFullRecipe(recipeId)
  }
  
  if (template) {
    gameState.selectedRecipeId = recipeId
    gameState.selectedRecipe = RecipeEngine.processRecipe(template, gameState.scaleFactor)
    gameState.currentStepIndex = 0
    gameState.currentScreen = 'recipe-detail'
    render()
  } else {
    console.error('Recipe not found:', recipeId)
  }
}

window.scaleRecipe = async (factor: number) => {
  if (gameState.selectedRecipeId) {
    // Find current template from Supabase or fallback
    let template = supabaseRecipes.find(r => r.id === gameState.selectedRecipeId)
    if (!template) {
      template = RECIPE_TEMPLATES[gameState.selectedRecipeId.toUpperCase().replace('-', '_')]
    }
    if (!template) {
      template = await RecipeLoader.loadFullRecipe(gameState.selectedRecipeId)
    }
    
    if (template) {
      gameState.scaleFactor = Math.max(0.5, Math.min(4, gameState.scaleFactor * factor))
      gameState.selectedRecipe = RecipeEngine.processRecipe(template, gameState.scaleFactor)
      render()
    }
  }
}

window.nextStep = () => {
  gameState.currentStepIndex++
  render()
}

window.startCooking = () => {
  gameState.currentScreen = 'recipe-production'
  render()
}

window.transferIngredient = (ingredient: string, amount: number = 1) => {
  console.log(`Transferred ${RecipeEngine.formatAmount(amount)} ${ingredient} to counter`)
  
  // Update counter ingredients
  const current = gameState.counterIngredients.get(ingredient) || 0
  gameState.counterIngredients.set(ingredient, current + amount)
  
  // Here we'll add Three.js subtraction animation later
  render()
}

window.proceedToPackaging = () => {
  gameState.currentScreen = 'packaging'
  render()
  
  // Initialize Three.js visualization when entering packaging
  setTimeout(() => {
    try {
      if (packagingViz) {
        packagingViz.destroy()
      }
      packagingViz = new PackagingVisualizer('three-container')
    } catch (error) {
      console.error('Failed to initialize packaging visualization:', error)
    }
  }, 100) // Small delay to ensure DOM is updated
}

// Packaging visualization functions
window.updatePiecesPerItem = (value: string) => {
  gameState.packagingState.piecesPerItem = parseInt(value)
  document.getElementById('pieces-per-item-value')!.textContent = value
  render()
}

window.updatePiecesPerParcel = (value: string) => {
  gameState.packagingState.piecesPerParcel = parseInt(value)
  document.getElementById('pieces-per-parcel-value')!.textContent = value
  render()
}

window.showBatch = () => {
  if (!packagingViz) return
  const recipe = gameState.selectedRecipe
  const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
  packagingViz.showBatch(totalItems)
}

window.animateDivision = async () => {
  if (!packagingViz) return
  const recipe = gameState.selectedRecipe
  const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
  await packagingViz.animateDivision(totalItems, gameState.packagingState.piecesPerItem)
}

window.animatePackaging = async () => {
  if (!packagingViz) return
  const recipe = gameState.selectedRecipe
  const totalItems = recipe ? Math.round(recipe.servings / 12) * 2 : 2
  const totalPieces = totalItems * gameState.packagingState.piecesPerItem
  await packagingViz.animatePackaging(totalPieces, gameState.packagingState.piecesPerParcel)
}

window.resetPackagingViz = () => {
  if (packagingViz) {
    packagingViz.clearVisualization()
  }
}

window.finishPackaging = () => {
  gameState.currentScreen = 'store'
  render()
}

window.sellPackage = () => {
  gameState.revenue += 5.99
  render()
}

window.buyIngredient = (ingredient: string) => {
  gameState.revenue -= 2.99
  console.log(`Bought ${ingredient}`)
  render()
}

window.goToSupplier = () => {
  gameState.currentScreen = 'supplier'
  render()
}

window.goToRecipes = () => {
  gameState.currentScreen = 'recipe-index'
  render()
}

window.goBack = () => {
  // Simple back navigation
  const backMap: Record<string, typeof gameState.currentScreen> = {
    'recipe-detail': 'recipe-index',
    'recipe-production': 'recipe-detail',
    'packaging': 'recipe-production',
    'store': 'packaging',
    'supplier': 'store'
  }
  
  gameState.currentScreen = backMap[gameState.currentScreen] || 'recipe-index'
  render()
}

// Render function
function render() {
  const uiOverlay = document.getElementById('ui-overlay')
  if (uiOverlay) {
    uiOverlay.innerHTML = screens[gameState.currentScreen]()
  }
}

// Initialize app
async function initializeApp() {
  // Try to load recipes from Supabase on startup
  try {
    const recipes = await RecipeLoader.loadRecipeTemplates()
    if (recipes.length > 0) {
      supabaseRecipes = recipes
      console.log(`✅ Loaded ${recipes.length} recipes from Supabase`)
    }
  } catch (error) {
    console.log('📦 Using local recipes (Supabase unavailable)')
  }
  
  render()
}

initializeApp()