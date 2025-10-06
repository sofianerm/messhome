-- ============================================
-- TABLE: favorite_meals (Repas favoris)
-- ============================================

CREATE TABLE IF NOT EXISTS favorite_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- ex: pâtes, viande, poisson, végétarien
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX favorite_meals_user_id_idx ON favorite_meals(user_id);
CREATE INDEX favorite_meals_category_idx ON favorite_meals(category);

-- RLS
ALTER TABLE favorite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view favorite meals (temp)"
  ON favorite_meals FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert favorite meals (temp)"
  ON favorite_meals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update favorite meals (temp)"
  ON favorite_meals FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete favorite meals (temp)"
  ON favorite_meals FOR DELETE
  USING (true);

-- Permettre user_id NULL temporairement
ALTER TABLE favorite_meals ALTER COLUMN user_id DROP NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_favorite_meals_updated_at BEFORE UPDATE ON favorite_meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Données initiales (repas courants)
-- ============================================
INSERT INTO favorite_meals (name, category, user_id) VALUES
  ('Pâtes bolognaise', 'pâtes', NULL),
  ('Pâtes carbonara', 'pâtes', NULL),
  ('Pâtes au pesto', 'pâtes', NULL),
  ('Lasagnes', 'pâtes', NULL),
  ('Riz sauté aux légumes', 'riz', NULL),
  ('Poulet rôti', 'viande', NULL),
  ('Poulet curry', 'viande', NULL),
  ('Steak frites', 'viande', NULL),
  ('Saumon grillé', 'poisson', NULL),
  ('Fish & chips', 'poisson', NULL),
  ('Pizza maison', 'pizza', NULL),
  ('Quiche lorraine', 'tarte', NULL),
  ('Ratatouille', 'végétarien', NULL),
  ('Salade César', 'salade', NULL),
  ('Burger maison', 'burger', NULL),
  ('Tacos', 'mexicain', NULL),
  ('Crêpes', 'dessert', NULL),
  ('Omelette', 'œufs', NULL),
  ('Soupe de légumes', 'soupe', NULL),
  ('Gratin dauphinois', 'gratin', NULL)
ON CONFLICT DO NOTHING;
