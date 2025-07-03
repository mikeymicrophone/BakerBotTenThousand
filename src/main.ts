import { proxy } from 'valtio'
import './style.css'
import { type ProcessedRecipe } from './lib/recipe-engine'

// Import the app shell component
import './components/app-shell'

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

// Clean initialization - no more global functions needed since components handle their own logic

// Initialize app with Lit components
async function initializeApp() {
  // Create app shell component
  const appShell = document.createElement('app-shell')
  const uiOverlay = document.getElementById('ui-overlay')
  
  if (uiOverlay) {
    uiOverlay.appendChild(appShell)
  }
  
  console.log('🎭 BakerBot10K initialized with Lit components')
}

initializeApp()