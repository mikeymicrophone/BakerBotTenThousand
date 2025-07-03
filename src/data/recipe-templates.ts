// Recipe templates with parameter injection (BakeWatt innovation preserved)
import type { RecipeTemplate, FlexibleIngredient } from '../types/recipe'
import { INGREDIENTS } from './ingredients'
import { UNSTARTABLE_RECIPE } from './unstartable-recipe'

// Helper function to create flexible ingredients
function createIngredient(ingredient: typeof INGREDIENTS[keyof typeof INGREDIENTS], amount: number | { min: number, max: number, recommended: number }, hint?: string): FlexibleIngredient {
  return {
    ingredient,
    amount,
    hint
  }
}

export const RECIPE_TEMPLATES: Record<string, RecipeTemplate> = {
  CHOCOLATE_COOKIES: {
    id: 'chocolate-cookies',
    name: 'Chocolate Chip Cookies',
    icon: '🍪',
    description: 'Classic chocolate chip cookies with customizable sweetness',
    difficulty: 'easy',
    baseServings: 24,
    estimatedTime: 45,
    categories: ['cookies', 'baking'],
    
    steps: [
      {
        id: 'preheat',
        name: 'Preheat Oven',
        description: 'Prepare oven for baking',
        order: 1,
        estimatedTime: 10,
        temperature: 375,
        instructions: [
          'Preheat oven to {temp}°F',
          'Line baking sheets with parchment paper'
        ],
        ingredients: [],
        groups: [],
        parameters: { temp: 375 }
      },
      
      {
        id: 'mix-dry',
        name: 'Mix Dry Ingredients',
        description: 'Combine dry ingredients',
        order: 2,
        estimatedTime: 5,
        instructions: [
          'In a bowl, whisk together {group:dry}',
          'Ensure even distribution of all dry ingredients',
          'Set aside for combining with wet ingredients'
        ],
        ingredients: [],
        groups: [
          {
            name: 'dry',
            description: 'Dry base ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.FLOUR, 2.25),
              createIngredient(INGREDIENTS.BAKING_POWDER, 1),
              createIngredient(INGREDIENTS.SALT, 0.5)
            ]
          }
        ],
        parameters: {}
      },
      
      {
        id: 'cream-wet',
        name: 'Cream Wet Ingredients',
        description: 'Cream butter and sugar, add eggs',
        order: 3,
        estimatedTime: 8,
        instructions: [
          'In a large bowl, cream {group:fats} until {consistency}',
          'Beat in {group:liquids} one at a time',
          'Mix until well combined - about {time} minutes total'
        ],
        ingredients: [],
        groups: [
          {
            name: 'fats',
            description: 'Fat ingredients for creaming',
            ingredients: [
              createIngredient(INGREDIENTS.BUTTER, 1),
              createIngredient(INGREDIENTS.SUGAR, { min: 0.5, max: 1.25, recommended: 0.75 }, 'Adjust sweetness to taste')
            ]
          },
          {
            name: 'liquids',
            description: 'Liquid ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.EGGS, 2),
              createIngredient(INGREDIENTS.VANILLA, 2)
            ]
          }
        ],
        parameters: { 
          consistency: 'light and fluffy',
          time: 3
        }
      },
      
      {
        id: 'combine',
        name: 'Combine & Add Mix-ins',
        description: 'Combine wet and dry, add chocolate chips',
        order: 4,
        estimatedTime: 5,
        instructions: [
          'Gradually fold dry mixture into wet ingredients',
          'Mix just until combined - do not overmix',
          'Fold in {group:mixins} until evenly distributed'
        ],
        ingredients: [],
        groups: [
          {
            name: 'mixins',
            description: 'Mix-in ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.CHOCOLATE_CHIPS, { min: 1, max: 2, recommended: 1.5 }, 'More chips = more chocolate!')
            ]
          }
        ],
        parameters: {}
      },
      
      {
        id: 'bake',
        name: 'Bake Cookies',
        description: 'Shape and bake the cookies',
        order: 5,
        estimatedTime: 12,
        temperature: 375,
        instructions: [
          'Drop rounded tablespoons of dough onto prepared baking sheets',
          'Space cookies {spacing} inches apart for even baking',
          'Bake for {time} minutes at {temp}°F',
          'Cookies should be golden brown around edges'
        ],
        ingredients: [],
        groups: [],
        parameters: {
          spacing: 2,
          time: 10,
          temp: 375
        }
      },
      
      {
        id: 'cool',
        name: 'Cool Cookies',
        description: 'Cool cookies properly',
        order: 6,
        estimatedTime: 10,
        instructions: [
          'Cool on baking sheet for {time} minutes',
          'Transfer to wire rack to cool completely',
          'Store in airtight container when completely cool'
        ],
        ingredients: [],
        groups: [],
        parameters: { time: 5 }
      }
    ]
  },
  
  VANILLA_CUPCAKES: {
    id: 'vanilla-cupcakes',
    name: 'Vanilla Cupcakes',
    icon: '🧁',
    description: 'Light and fluffy vanilla cupcakes',
    difficulty: 'medium',
    baseServings: 12,
    estimatedTime: 60,
    categories: ['cupcakes', 'baking'],
    
    steps: [
      {
        id: 'preheat',
        name: 'Preheat & Prep',
        description: 'Prepare oven and cupcake pans',
        order: 1,
        estimatedTime: 10,
        temperature: 350,
        instructions: [
          'Preheat oven to {temp}°F',
          'Line cupcake pans with paper liners',
          'Ensure all ingredients are at room temperature'
        ],
        ingredients: [],
        groups: [],
        parameters: { temp: 350 }
      },
      
      {
        id: 'mix-batter',
        name: 'Make Cupcake Batter',
        description: 'Mix cupcake batter',
        order: 2,
        estimatedTime: 15,
        instructions: [
          'Cream {group:base} until light and fluffy',
          'Beat in {group:wet} alternating with {group:dry}',
          'Mix until just combined - do not overmix'
        ],
        ingredients: [],
        groups: [
          {
            name: 'base',
            description: 'Base creaming ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.BUTTER, 0.5),
              createIngredient(INGREDIENTS.SUGAR, { min: 0.75, max: 1.25, recommended: 1 }, 'Adjust sweetness preference')
            ]
          },
          {
            name: 'wet',
            description: 'Wet ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.EGGS, 2),
              createIngredient(INGREDIENTS.VANILLA, { min: 1, max: 3, recommended: 2 }, 'More vanilla = stronger flavor'),
              createIngredient(INGREDIENTS.MILK, 0.5)
            ]
          },
          {
            name: 'dry',
            description: 'Dry ingredients',
            ingredients: [
              createIngredient(INGREDIENTS.FLOUR, 1.5),
              createIngredient(INGREDIENTS.BAKING_POWDER, 1.5),
              createIngredient(INGREDIENTS.SALT, 0.25)
            ]
          }
        ],
        parameters: {}
      },
      
      {
        id: 'bake',
        name: 'Bake Cupcakes',
        description: 'Bake until golden',
        order: 3,
        estimatedTime: 20,
        temperature: 350,
        instructions: [
          'Fill cupcake liners {fill} full with batter',
          'Bake for {time} minutes at {temp}°F',
          'Test doneness with toothpick - should come out clean'
        ],
        ingredients: [],
        groups: [],
        parameters: {
          fill: '2/3',
          time: 18,
          temp: 350
        }
      }
    ]
  },

  UNSTARTABLE_CROISSANT: UNSTARTABLE_RECIPE
}