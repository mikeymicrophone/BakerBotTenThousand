// Unstartable Recipe Example
import { RecipeTemplate } from '../types/recipe';

export const UNSTARTABLE_RECIPE: RecipeTemplate = {
  id: 'unstartable-croissant',
  name: 'Experimental Croissant',
  icon: '🥐',
  description: 'An experimental recipe that is not yet available.',
  difficulty: 'hard',
  baseServings: 12,
  estimatedTime: 180,
  unstartable: true,
  notes: 'This recipe is currently under development and cannot be started.',
  categories: ['Viennoiserie', 'Experimental'],
  steps: [], // No steps as it's unstartable
};