-- BakerBot10K Database Schema
-- Comprehensive schema including equipment, masters, and techniques

-- =============================================
-- CORE INGREDIENT SYSTEM
-- =============================================

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'flour', 'sugar'
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'cups', 'tsp', 'whole', etc.
  icon TEXT, -- emoji or icon identifier
  category TEXT, -- 'dry', 'wet', 'fat', 'leavening', 'flavoring'
  base_price DECIMAL(10,2), -- price per unit for supplier
  nutrition_data JSONB, -- calories, protein, etc. per unit
  storage_requirements TEXT[], -- 'cool', 'dry', 'refrigerated'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- EQUIPMENT SYSTEM (NEW FEATURE)
-- =============================================

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'stand-mixer', 'oven', 'whisk'
  name TEXT NOT NULL,
  icon TEXT,
  category TEXT, -- 'mixing', 'baking', 'measuring', 'cutting'
  description TEXT,
  base_cost DECIMAL(10,2), -- purchase cost
  unlock_level INTEGER DEFAULT 1, -- what level player needs to access
  efficiency_bonus DECIMAL(3,2) DEFAULT 1.0, -- time multiplier when used
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MASTERS & TECHNIQUE SYSTEM (NEW FEATURE)
-- =============================================

CREATE TABLE masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'julia-child', 'gordon-ramsay'
  name TEXT NOT NULL,
  avatar TEXT, -- image or emoji
  specialty TEXT NOT NULL, -- 'french-pastry', 'bread-making', 'chocolate-work'
  bio TEXT,
  unlock_requirements JSONB, -- conditions to meet this master
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g., 'proper-creaming', 'folding-method'
  name TEXT NOT NULL,
  description TEXT,
  master_id UUID REFERENCES masters(id),
  category TEXT, -- 'mixing', 'temperature', 'timing', 'presentation'
  difficulty_level INTEGER DEFAULT 1, -- 1-5 complexity
  learning_curve JSONB, -- progression data for mastery
  benefits JSONB, -- what improvements this technique provides
  tutorial_steps TEXT[], -- step-by-step learning instructions
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENHANCED RECIPE SYSTEM
-- =============================================

CREATE TABLE recipe_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  base_servings INTEGER NOT NULL,
  estimated_time_minutes INTEGER,
  categories TEXT[], -- array of category tags
  unlock_requirements JSONB, -- level, techniques, equipment needed
  nutrition_profile JSONB, -- aggregate nutrition data
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipe_templates(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'preparation', 'mixing', 'baking', 'cooling', 'decoration'
  name TEXT NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL, -- array with parameter placeholders
  parameters JSONB DEFAULT '{}', -- default parameter values
  estimated_time_minutes INTEGER,
  temperature_f INTEGER,
  
  -- NEW: Equipment and technique requirements
  required_equipment UUID[] DEFAULT '{}', -- array of equipment.id
  optional_equipment UUID[] DEFAULT '{}',
  required_techniques UUID[] DEFAULT '{}', -- array of techniques.id
  technique_impact JSONB, -- how techniques affect this step
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recipe_id, step_order)
);

CREATE TABLE recipe_step_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES recipe_steps(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  amount_type TEXT CHECK (amount_type IN ('fixed', 'flexible')) DEFAULT 'fixed',
  
  -- Fixed amount
  fixed_amount DECIMAL(10,3),
  
  -- Flexible amount range
  min_amount DECIMAL(10,3),
  max_amount DECIMAL(10,3),
  recommended_amount DECIMAL(10,3),
  step_size DECIMAL(10,3) DEFAULT 0.1,
  
  customization_hint TEXT, -- "Adjust sweetness to taste"
  group_name TEXT, -- 'dry', 'wet', 'fats' for instruction grouping
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USER PROGRESSION SYSTEM
-- =============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar TEXT,
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins DECIMAL(10,2) DEFAULT 100.00, -- starting money
  preferences JSONB DEFAULT '{}', -- UI preferences, difficulty settings
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User equipment ownership
CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  condition_rating INTEGER DEFAULT 100, -- 0-100, affects efficiency
  UNIQUE(user_id, equipment_id)
);

-- User technique mastery progression
CREATE TABLE user_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES techniques(id),
  mastery_level INTEGER DEFAULT 0, -- 0-100 progression
  first_learned_at TIMESTAMPTZ DEFAULT now(),
  last_practiced_at TIMESTAMPTZ DEFAULT now(),
  practice_count INTEGER DEFAULT 0,
  UNIQUE(user_id, technique_id)
);

-- User master relationships (unlocked mentors)
CREATE TABLE user_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  relationship_level INTEGER DEFAULT 1, -- 1-5, affects available techniques
  lessons_completed INTEGER DEFAULT 0,
  UNIQUE(user_id, master_id)
);

-- =============================================
-- GAME SESSION SYSTEM
-- =============================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipe_templates(id),
  scale_factor DECIMAL(4,2) DEFAULT 1.0,
  current_step_index INTEGER DEFAULT 0,
  
  -- Inventory tracking
  pantry_inventory JSONB DEFAULT '{}', -- ingredient_id -> amount
  counter_ingredients JSONB DEFAULT '{}', -- staged for current step
  
  -- Equipment and technique usage
  available_equipment UUID[] DEFAULT '{}',
  techniques_used JSONB DEFAULT '{}', -- technique_id -> usage_data
  
  -- Session state
  session_data JSONB DEFAULT '{}', -- UI state, progress, notes
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Performance tracking
  total_time_minutes INTEGER,
  technique_scores JSONB, -- performance metrics per technique
  equipment_efficiency JSONB -- how well equipment was used
);

-- =============================================
-- PRODUCTION & STORE SYSTEM
-- =============================================

CREATE TABLE store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipe_templates(id),
  name TEXT NOT NULL,
  icon TEXT,
  quantity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  
  -- Production details
  scale_factor DECIMAL(4,2),
  pieces_per_item INTEGER,
  pieces_per_package INTEGER,
  
  -- Quality modifiers based on technique usage
  quality_score INTEGER DEFAULT 50, -- 0-100
  technique_bonuses JSONB DEFAULT '{}',
  equipment_bonuses JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- EDUCATIONAL ANALYTICS
-- =============================================

CREATE TABLE learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES game_sessions(id),
  
  -- Educational metrics
  math_concepts_practiced TEXT[], -- 'multiplication', 'division', 'fractions'
  technique_improvements JSONB, -- before/after skill measurements
  equipment_learning_curve JSONB, -- efficiency over time
  
  -- Performance data
  accuracy_percentage DECIMAL(5,2),
  completion_time_minutes INTEGER,
  help_requests INTEGER DEFAULT 0,
  
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_recipe_steps_recipe_order ON recipe_steps(recipe_id, step_order);
CREATE INDEX idx_step_ingredients_step ON recipe_step_ingredients(step_id);
CREATE INDEX idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX idx_user_techniques_user ON user_techniques(user_id);
CREATE INDEX idx_game_sessions_user_active ON game_sessions(user_id) WHERE completed_at IS NULL;
CREATE INDEX idx_store_items_user ON store_items(user_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own equipment" ON user_equipment
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own techniques" ON user_techniques
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own masters" ON user_masters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON game_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own store" ON store_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for reference data
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_step_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Anyone can read masters" ON masters FOR SELECT USING (true);
CREATE POLICY "Anyone can read techniques" ON techniques FOR SELECT USING (true);
CREATE POLICY "Anyone can read recipes" ON recipe_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can read recipe steps" ON recipe_steps FOR SELECT USING (true);
CREATE POLICY "Anyone can read recipe ingredients" ON recipe_step_ingredients FOR SELECT USING (true);