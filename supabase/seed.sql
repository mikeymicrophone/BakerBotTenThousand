-- BakerBot10K Seed Data
-- Initial data for equipment, masters, techniques, and enhanced recipes

-- =============================================
-- SEED INGREDIENTS
-- =============================================

INSERT INTO ingredients (slug, name, unit, icon, category, base_price, nutrition_data) VALUES
('flour', 'All-Purpose Flour', 'cups', '🌾', 'dry', 2.99, '{"calories": 455, "protein": 13, "carbs": 95}'),
('sugar', 'Granulated Sugar', 'cups', '🧂', 'dry', 1.99, '{"calories": 774, "carbs": 200}'),
('butter', 'Unsalted Butter', 'cups', '🧈', 'fat', 4.99, '{"calories": 1628, "fat": 184}'),
('eggs', 'Large Eggs', 'whole', '🥚', 'wet', 0.25, '{"calories": 70, "protein": 6, "fat": 5}'),
('vanilla', 'Vanilla Extract', 'tsp', '🍦', 'flavoring', 0.50, '{"calories": 12}'),
('chocolate_chips', 'Chocolate Chips', 'cups', '🍫', 'mix-in', 3.99, '{"calories": 805, "fat": 50, "carbs": 106}'),
('baking_powder', 'Baking Powder', 'tsp', '🥄', 'leavening', 0.10, '{"calories": 2}'),
('salt', 'Table Salt', 'tsp', '🧂', 'seasoning', 0.05, '{"sodium": 2300}'),
('milk', 'Whole Milk', 'cups', '🥛', 'wet', 1.25, '{"calories": 149, "protein": 8, "fat": 8}'),
('cocoa_powder', 'Unsweetened Cocoa', 'tbsp', '🍫', 'dry', 0.75, '{"calories": 12, "fiber": 2}');

-- =============================================
-- SEED EQUIPMENT
-- =============================================

INSERT INTO equipment (slug, name, icon, category, description, base_cost, unlock_level, efficiency_bonus) VALUES
-- Basic equipment (available from start)
('mixing_bowl', 'Mixing Bowl', '🥣', 'mixing', 'Essential for combining ingredients', 15.00, 1, 1.0),
('whisk', 'Wire Whisk', '🥄', 'mixing', 'For light mixing and aerating', 8.00, 1, 1.0),
('measuring_cups', 'Measuring Cups', '📏', 'measuring', 'Accurate ingredient measurement', 12.00, 1, 1.0),
('baking_sheet', 'Baking Sheet', '📄', 'baking', 'Flat pan for cookies and pastries', 20.00, 1, 1.0),

-- Intermediate equipment
('hand_mixer', 'Electric Hand Mixer', '🔌', 'mixing', 'Faster mixing with consistent results', 35.00, 3, 1.2),
('silicone_spatula', 'Silicone Spatula', '🥄', 'mixing', 'Perfect for folding and scraping', 10.00, 2, 1.1),
('digital_scale', 'Digital Kitchen Scale', '⚖️', 'measuring', 'Precise weight-based measuring', 45.00, 4, 1.3),
('convection_oven', 'Convection Oven', '🔥', 'baking', 'Even heat distribution', 299.00, 5, 1.4),

-- Advanced equipment  
('stand_mixer', 'Stand Mixer', '🍴', 'mixing', 'Professional-grade mixing power', 199.00, 6, 1.5),
('pastry_torch', 'Culinary Torch', '🔥', 'finishing', 'For caramelizing and browning', 25.00, 7, 1.2),
('proofing_basket', 'Banneton Proofing Basket', '🧺', 'preparation', 'Professional bread shaping', 18.00, 8, 1.1),
('thermometer', 'Instant-Read Thermometer', '🌡️', 'measuring', 'Precise temperature control', 22.00, 5, 1.2);

-- =============================================
-- SEED MASTERS
-- =============================================

INSERT INTO masters (slug, name, avatar, specialty, bio, unlock_requirements) VALUES
('grandma_rose', 'Grandma Rose', '👵', 'comfort-baking', 'Traditional family recipes passed down through generations. Specializes in cookies, cakes, and hearty breads.', '{"level": 1}'),

('chef_marcel', 'Chef Marcel', '👨‍🍳', 'french-pastry', 'Classically trained French pastry chef. Expert in delicate techniques and precision baking.', '{"level": 5, "techniques": ["proper_creaming"]}'),

('baker_elena', 'Baker Elena', '👩‍🍳', 'artisan-bread', 'Artisan bread specialist focused on wild yeast, long fermentation, and traditional methods.', '{"level": 8, "equipment": ["proofing_basket"]}'),

('chocolatier_david', 'Chocolatier David', '🍫', 'chocolate-work', 'Master chocolatier specializing in tempering, ganache, and chocolate decoration techniques.', '{"level": 10, "techniques": ["temperature_control", "proper_creaming"]}'),

('pastry_chef_luna', 'Chef Luna', '🌙', 'modern-techniques', 'Innovative pastry chef combining traditional skills with modern molecular gastronomy.', '{"level": 12, "equipment": ["pastry_torch", "digital_scale"]}');

-- =============================================
-- SEED TECHNIQUES
-- =============================================

INSERT INTO techniques (slug, name, description, master_id, category, difficulty_level, benefits, tutorial_steps) VALUES
-- Basic techniques (Grandma Rose)
('proper_creaming', 'Proper Creaming Method', 'The foundation of light, fluffy baked goods through proper butter and sugar incorporation.', 
  (SELECT id FROM masters WHERE slug = 'grandma_rose'), 'mixing', 2,
  '{"texture_improvement": 25, "volume_increase": 15, "time_efficiency": 10}',
  ARRAY['Start with room temperature butter', 'Add sugar gradually', 'Beat for 3-5 minutes until light and fluffy', 'Scrape bowl sides regularly']),

('gentle_folding', 'Gentle Folding Technique', 'Preserving air bubbles when combining ingredients for maximum volume.', 
  (SELECT id FROM masters WHERE slug = 'grandma_rose'), 'mixing', 1,
  '{"volume_retention": 20, "texture_improvement": 15}',
  ARRAY['Use large spatula or spoon', 'Cut down through center', 'Scrape across bottom', 'Lift and fold over', 'Rotate bowl quarter turn', 'Repeat until just combined']),

-- Intermediate techniques (Chef Marcel)
('temperature_control', 'Precision Temperature Control', 'Understanding how temperature affects texture, rise, and flavor development.', 
  (SELECT id FROM masters WHERE slug = 'chef_marcel'), 'temperature', 3,
  '{"consistency_improvement": 30, "failure_reduction": 40}',
  ARRAY['Use thermometer for accuracy', 'Learn ingredient temperature requirements', 'Monitor oven hot spots', 'Understand carryover cooking']),

('lamination', 'Dough Lamination', 'Creating flaky, layered pastries through butter incorporation and folding.', 
  (SELECT id FROM masters WHERE slug = 'chef_marcel'), 'preparation', 4,
  '{"texture_improvement": 50, "professional_quality": 35}',
  ARRAY['Keep butter and dough at same consistency', 'Roll evenly without breaking', 'Fold in thirds (letter fold)', 'Chill between folds', 'Repeat 3-6 times']),

-- Advanced techniques (Baker Elena)
('autolyse', 'Autolyse Method', 'Resting flour and water to develop gluten naturally before adding other ingredients.', 
  (SELECT id FROM masters WHERE slug = 'baker_elena'), 'preparation', 3,
  '{"gluten_development": 40, "texture_improvement": 25, "time_efficiency": 20}',
  ARRAY['Mix only flour and water', 'Rest 20-60 minutes', 'Add salt and yeast after rest', 'Observe improved dough texture']),

('stretch_and_fold', 'Stretch and Fold Technique', 'Building dough strength through gentle handling instead of aggressive kneading.', 
  (SELECT id FROM masters WHERE slug = 'baker_elena'), 'preparation', 2,
  '{"gluten_development": 30, "gentle_handling": 25}',
  ARRAY['Wet hands to prevent sticking', 'Grab one side of dough', 'Stretch up and fold over', 'Rotate bowl 90 degrees', 'Repeat 4 times', 'Rest 30 minutes between sets']),

-- Expert techniques (Chocolatier David)
('chocolate_tempering', 'Chocolate Tempering', 'Achieving the perfect crystalline structure for shiny, stable chocolate.', 
  (SELECT id FROM masters WHERE slug = 'chocolatier_david'), 'temperature', 5,
  '{"professional_finish": 60, "stability": 50, "appearance": 40}',
  ARRAY['Heat chocolate to 115°F', 'Cool to 84°F while stirring', 'Reheat to 88°F', 'Test temper on parchment', 'Work quickly while in temper']),

-- Modern techniques (Chef Luna)  
('spherification', 'Basic Spherification', 'Creating caviar-like spheres that burst with flavor using molecular gastronomy.', 
  (SELECT id FROM masters WHERE slug = 'pastry_chef_luna'), 'modern', 4,
  '{"innovation_factor": 70, "presentation": 50}',
  ARRAY['Prepare calcium chloride bath', 'Blend sodium alginate with liquid', 'Form spheres with hemisphere spoon', 'Bath for 1-2 minutes', 'Rinse in clean water']);

-- =============================================
-- ENHANCED RECIPE TEMPLATES
-- =============================================

INSERT INTO recipe_templates (slug, name, icon, description, difficulty, base_servings, estimated_time_minutes, categories, unlock_requirements) VALUES
('chocolate_cookies', 'Chocolate Chip Cookies', '🍪', 'Classic cookies with equipment and technique progression', 'easy', 24, 45, 
  ARRAY['cookies', 'comfort-baking'], 
  '{"level": 1, "equipment": ["mixing_bowl", "measuring_cups"], "masters": []}'),

('french_macarons', 'French Macarons', '🥐', 'Delicate sandwich cookies requiring precision and technique', 'expert', 20, 180, 
  ARRAY['pastry', 'french'], 
  '{"level": 10, "equipment": ["digital_scale", "stand_mixer"], "masters": ["chef_marcel"], "techniques": ["proper_creaming", "gentle_folding"]}'),

('artisan_sourdough', 'Artisan Sourdough Bread', '🍞', 'Traditional bread using wild yeast and time-honored techniques', 'hard', 1, 1440, 
  ARRAY['bread', 'artisan'], 
  '{"level": 8, "equipment": ["proofing_basket", "digital_scale"], "masters": ["baker_elena"], "techniques": ["autolyse", "stretch_and_fold"]}');

-- =============================================
-- ENHANCED RECIPE STEPS WITH EQUIPMENT/TECHNIQUES
-- =============================================

-- Chocolate Chip Cookies with progression
INSERT INTO recipe_steps (recipe_id, step_order, step_type, name, description, instructions, parameters, estimated_time_minutes, required_equipment, optional_equipment, required_techniques, technique_impact) VALUES

((SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies'), 1, 'preparation', 'Preheat Oven', 'Prepare oven for baking',
  '["Preheat oven to {temp}°F", "Line baking sheets with parchment paper"]',
  '{"temp": 375}', 10, 
  ARRAY[(SELECT id FROM equipment WHERE slug = 'baking_sheet')], 
  ARRAY[(SELECT id FROM equipment WHERE slug = 'convection_oven')], 
  '{}', 
  '{"convection_oven": {"time_reduction": 10, "even_browning": true}}'),

((SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies'), 2, 'mixing', 'Cream Butter and Sugar', 'Create light, fluffy base',
  '["Cream {group:fats} until {consistency}", "This should take about {time} minutes with proper technique"]',
  '{"consistency": "light and fluffy", "time": 5}', 8,
  ARRAY[(SELECT id FROM equipment WHERE slug = 'mixing_bowl')],
  ARRAY[(SELECT id FROM equipment WHERE slug = 'hand_mixer'), (SELECT id FROM equipment WHERE slug = 'stand_mixer')],
  ARRAY[(SELECT id FROM techniques WHERE slug = 'proper_creaming')],
  '{"proper_creaming": {"texture_improvement": 25, "success_rate": 40}, "hand_mixer": {"time_reduction": 50}, "stand_mixer": {"time_reduction": 70, "consistency": 30}}'),

((SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies'), 3, 'mixing', 'Add Eggs and Vanilla', 'Incorporate wet ingredients',
  '["Beat in {group:wet} one at a time", "Mix until well combined"]',
  '{}', 3,
  ARRAY[(SELECT id FROM equipment WHERE slug = 'mixing_bowl')],
  ARRAY[(SELECT id FROM equipment WHERE slug = 'hand_mixer')],
  '{}', '{}'),

((SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies'), 4, 'mixing', 'Combine Dry Ingredients', 'Gentle incorporation to avoid tough cookies',
  '["Gradually fold in {group:dry}", "Mix just until combined - do not overmix"]',
  '{}', 5,
  ARRAY[(SELECT id FROM equipment WHERE slug = 'mixing_bowl')],
  ARRAY[(SELECT id FROM equipment WHERE slug = 'silicone_spatula')],
  ARRAY[(SELECT id FROM techniques WHERE slug = 'gentle_folding')],
  '{"gentle_folding": {"texture_improvement": 20, "tenderness": 25}, "silicone_spatula": {"efficiency": 15}}'),

((SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies'), 5, 'baking', 'Bake Cookies', 'Transform dough into golden cookies',
  '["Drop rounded tablespoons onto prepared sheets", "Bake for {time} minutes until golden brown"]',
  '{"time": 10}', 12,
  ARRAY[(SELECT id FROM equipment WHERE slug = 'baking_sheet')],
  ARRAY[(SELECT id FROM equipment WHERE slug = 'convection_oven')],
  '{}',
  '{"convection_oven": {"even_baking": true, "time_reduction": 15}}');

-- =============================================
-- RECIPE STEP INGREDIENTS  
-- =============================================

-- Chocolate cookies ingredients with flexibility
INSERT INTO recipe_step_ingredients (step_id, ingredient_id, amount_type, fixed_amount, min_amount, max_amount, recommended_amount, customization_hint, group_name) VALUES

-- Step 2: Creaming (fats group)
((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 2), 
 (SELECT id FROM ingredients WHERE slug = 'butter'), 'fixed', 1.0, NULL, NULL, NULL, NULL, 'fats'),

((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 2), 
 (SELECT id FROM ingredients WHERE slug = 'sugar'), 'flexible', NULL, 0.5, 1.25, 0.75, 'Adjust sweetness to taste', 'fats'),

-- Step 3: Wet ingredients
((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 3), 
 (SELECT id FROM ingredients WHERE slug = 'eggs'), 'fixed', 2.0, NULL, NULL, NULL, NULL, 'wet'),

((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 3), 
 (SELECT id FROM ingredients WHERE slug = 'vanilla'), 'fixed', 2.0, NULL, NULL, NULL, NULL, 'wet'),

-- Step 4: Dry ingredients
((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 4), 
 (SELECT id FROM ingredients WHERE slug = 'flour'), 'fixed', 2.25, NULL, NULL, NULL, NULL, 'dry'),

((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 4), 
 (SELECT id FROM ingredients WHERE slug = 'baking_powder'), 'fixed', 1.0, NULL, NULL, NULL, NULL, 'dry'),

((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 4), 
 (SELECT id FROM ingredients WHERE slug = 'salt'), 'fixed', 0.5, NULL, NULL, NULL, NULL, 'dry'),

((SELECT id FROM recipe_steps WHERE recipe_id = (SELECT id FROM recipe_templates WHERE slug = 'chocolate_cookies') AND step_order = 4), 
 (SELECT id FROM ingredients WHERE slug = 'chocolate_chips'), 'flexible', NULL, 1.0, 2.0, 1.5, 'More chips = more chocolate!', NULL);