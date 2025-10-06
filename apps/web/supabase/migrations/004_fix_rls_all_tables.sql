-- ============================================
-- FIX RLS POUR TOUTES LES TABLES RESTANTES
-- ============================================

-- ============================================
-- SHOPPING_ITEMS
-- ============================================
DROP POLICY IF EXISTS "Users can insert shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Users can delete their own shopping items" ON shopping_items;

CREATE POLICY "Anyone can insert shopping items (temp)"
  ON shopping_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete shopping items (temp)"
  ON shopping_items FOR DELETE
  USING (true);

ALTER TABLE shopping_items ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- MEALS
-- ============================================
DROP POLICY IF EXISTS "Users can insert meals" ON meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON meals;

CREATE POLICY "Anyone can insert meals (temp)"
  ON meals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update meals (temp)"
  ON meals FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete meals (temp)"
  ON meals FOR DELETE
  USING (true);

ALTER TABLE meals ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- TASKS
-- ============================================
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

CREATE POLICY "Anyone can insert tasks (temp)"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks (temp)"
  ON tasks FOR DELETE
  USING (true);

ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL;
