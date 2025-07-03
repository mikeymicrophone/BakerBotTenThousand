// Base ingredient definitions
import type { Ingredient } from '../types/recipe'

export const INGREDIENTS: Record<string, Ingredient> = {
  FLOUR: {
    id: 'flour',
    name: 'All-Purpose Flour',
    unit: 'cups',
    icon: '🌾',
    costPerUnit: 0.25 // $0.25 per cup
  },
  
  SUGAR: {
    id: 'sugar',
    name: 'Granulated Sugar',
    unit: 'cups',
    icon: '🧂',
    costPerUnit: 0.30 // $0.30 per cup
  },
  
  BUTTER: {
    id: 'butter',
    name: 'Unsalted Butter',
    unit: 'cups',
    icon: '🧈',
    costPerUnit: 0.80 // $0.80 per cup
  },
  
  EGGS: {
    id: 'eggs',
    name: 'Large Eggs',
    unit: 'whole',
    icon: '🥚',
    costPerUnit: 0.20 // $0.20 per egg
  },
  
  VANILLA: {
    id: 'vanilla',
    name: 'Vanilla Extract',
    unit: 'tsp',
    icon: '🍦',
    costPerUnit: 0.40 // $0.40 per tsp
  },
  
  CHOCOLATE_CHIPS: {
    id: 'chocolate_chips',
    name: 'Chocolate Chips',
    unit: 'cups',
    icon: '🍫',
    costPerUnit: 1.50 // $1.50 per cup
  },
  
  BAKING_POWDER: {
    id: 'baking_powder',
    name: 'Baking Powder',
    unit: 'tsp',
    icon: '🥄',
    costPerUnit: 0.10 // $0.10 per tsp
  },
  
  SALT: {
    id: 'salt',
    name: 'Salt',
    unit: 'tsp',
    icon: '🧂',
    costPerUnit: 0.05 // $0.05 per tsp
  },
  
  MILK: {
    id: 'milk',
    name: 'Whole Milk',
    unit: 'cups',
    icon: '🥛',
    costPerUnit: 0.40 // $0.40 per cup
  },
  
  COCOA_POWDER: {
    id: 'cocoa_powder',
    name: 'Cocoa Powder',
    unit: 'tbsp',
    icon: '🍫',
    costPerUnit: 0.35 // $0.35 per tbsp
  }
}