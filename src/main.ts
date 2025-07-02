import { proxy } from 'valtio'
import './style.css'
import { RECIPE_TEMPLATES } from './data/recipe-templates'
import { RecipeEngine, type ProcessedRecipe } from './lib/recipe-engine'

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
  revenue: 100 // Start with some money
})

// Screen components
const screens = {
  'recipe-index': () => {
    const recipes = Object.values(RECIPE_TEMPLATES)
    
    return `
      <div class="ui-panel">
        <h2>📚 Recipe Collection</h2>
        <p>Choose a recipe to start baking!</p>
        
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
  
  'packaging': () => `
    <div class="ui-panel">
      <h2>📦 Packaging</h2>
      <p>Decide how to package your baked goods.</p>
      
      <div class="packaging-controls">
        <h3>You made: 12 cookies</h3>
        
        <div class="math-equation">
          <p>12 cookies ÷ 4 per package = 3 packages</p>
        </div>
        
        <div class="slider-group">
          <label>Cookies per package:</label>
          <input type="range" min="1" max="12" value="4" />
          <span>4</span>
        </div>
      </div>
      
      <div class="button-group">
        <button onclick="goBack()">← Back</button>
        <button onclick="finishPackaging()" class="btn-primary">Finish Packaging →</button>
      </div>
    </div>
  `,
  
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
  }
}

window.selectRecipe = (recipeId: string) => {
  const template = RECIPE_TEMPLATES[recipeId.toUpperCase().replace('-', '_')]
  if (template) {
    gameState.selectedRecipeId = recipeId
    gameState.selectedRecipe = RecipeEngine.processRecipe(template, gameState.scaleFactor)
    gameState.currentStepIndex = 0
    gameState.currentScreen = 'recipe-detail'
    render()
  }
}

window.scaleRecipe = (factor: number) => {
  if (gameState.selectedRecipeId) {
    const template = RECIPE_TEMPLATES[gameState.selectedRecipeId.toUpperCase().replace('-', '_')]
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
render()