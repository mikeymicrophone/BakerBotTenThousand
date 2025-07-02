// Base ingredient definitions
import type { Ingredient } from '../types/recipe'

export const INGREDIENTS: Record<string, Ingredient> = {
  FLOUR: {
    id: 'flour',
    name: 'All-Purpose Flour',
    unit: 'cups',
    icon: '🌾'
  },
  
  SUGAR: {
    id: 'sugar',
    name: 'Granulated Sugar',
    unit: 'cups',
    icon: '🧂'
  },
  
  BUTTER: {
    id: 'butter',
    name: 'Unsalted Butter',
    unit: 'cups',
    icon: '🧈'
  },
  
  EGGS: {
    id: 'eggs',
    name: 'Large Eggs',
    unit: 'whole',
    icon: '🥚'
  },
  
  VANILLA: {
    id: 'vanilla',
    name: 'Vanilla Extract',
    unit: 'tsp',
    icon: '🍦'
  },
  
  CHOCOLATE_CHIPS: {
    id: 'chocolate_chips',
    name: 'Chocolate Chips',
    unit: 'cups',
    icon: '🍫'
  },
  
  BAKING_POWDER: {
    id: 'baking_powder',
    name: 'Baking Powder',
    unit: 'tsp',
    icon: '🥄'
  },
  
  SALT: {
    id: 'salt',
    name: 'Salt',
    unit: 'tsp',
    icon: '🧂'
  },
  
  MILK: {
    id: 'milk',
    name: 'Whole Milk',
    unit: 'cups',
    icon: '🥛'
  },
  
  COCOA_POWDER: {
    id: 'cocoa_powder',
    name: 'Cocoa Powder',
    unit: 'tbsp',
    icon: '🍫'
  }
}