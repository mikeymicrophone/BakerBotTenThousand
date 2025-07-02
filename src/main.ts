import { proxy } from 'valtio'
import './style.css'

// Simple game state with Valtio
export const gameState = proxy({
  currentScreen: 'recipe-index' as 'recipe-index' | 'recipe-detail' | 'recipe-production' | 'packaging' | 'store' | 'supplier',
  selectedRecipe: null as any,
  pantryIngredients: new Map(),
  counterIngredients: new Map(),
  packages: [],
  revenue: 0
})

// Screen components
const screens = {
  'recipe-index': () => `
    <div class="ui-panel">
      <h2>📚 Recipe Collection</h2>
      <p>Choose a recipe to start baking!</p>
      
      <div class="recipe-grid">
        <div class="recipe-card" onclick="selectRecipe('chocolate-cookies')">
          <div class="recipe-icon">🍪</div>
          <h3>Chocolate Cookies</h3>
          <p>Easy • 30 min</p>
        </div>
        
        <div class="recipe-card" onclick="selectRecipe('vanilla-cupcakes')">
          <div class="recipe-icon">🧁</div>
          <h3>Vanilla Cupcakes</h3>
          <p>Medium • 45 min</p>
        </div>
      </div>
    </div>
  `,
  
  'recipe-detail': () => `
    <div class="ui-panel">
      <h2>🍪 Recipe Details</h2>
      <p>Review ingredients and scaling options.</p>
      
      <div class="recipe-info">
        <h3>Chocolate Cookies</h3>
        <p>Servings: 12 cookies</p>
        
        <div class="ingredients-list">
          <h4>Ingredients needed:</h4>
          <ul>
            <li>Flour: 2 cups</li>
            <li>Sugar: 1 cup</li>
            <li>Butter: 0.5 cup</li>
            <li>Chocolate chips: 1 cup</li>
          </ul>
        </div>
      </div>
      
      <div class="button-group">
        <button onclick="goBack()">← Back</button>
        <button onclick="startCooking()" class="btn-primary">Start Cooking →</button>
      </div>
    </div>
  `,
  
  'recipe-production': () => `
    <div class="ui-panel">
      <h2>🔥 Recipe Production</h2>
      <p>Move ingredients from pantry to counter.</p>
      
      <div class="cooking-step">
        <h3>Step 1: Gather Ingredients</h3>
        <p>Transfer the required ingredients to your baking counter.</p>
        
        <div class="ingredient-zones">
          <div class="ingredient-card">
            <span>🌾 Flour: 2 cups</span>
            <button onclick="transferIngredient('flour')">Transfer</button>
          </div>
          
          <div class="ingredient-card">
            <span>🧂 Sugar: 1 cup</span>
            <button onclick="transferIngredient('sugar')">Transfer</button>
          </div>
        </div>
      </div>
      
      <div class="button-group">
        <button onclick="goBack()">← Back</button>
        <button onclick="proceedToPackaging()" class="btn-primary">Proceed to Packaging →</button>
      </div>
    </div>
  `,
  
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
    startCooking: () => void
    transferIngredient: (ingredient: string) => void
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
  gameState.selectedRecipe = recipeId
  gameState.currentScreen = 'recipe-detail'
  render()
}

window.startCooking = () => {
  gameState.currentScreen = 'recipe-production'
  render()
}

window.transferIngredient = (ingredient: string) => {
  console.log(`Transferred ${ingredient} to counter`)
  // Here we'll add Three.js subtraction animation later
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