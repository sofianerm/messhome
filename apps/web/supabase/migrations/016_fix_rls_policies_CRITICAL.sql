-- Migration 016: CORRECTION CRITIQUE DES POLITIQUES RLS
-- PROBLÈME: Tous les utilisateurs voient les données de tous les autres utilisateurs
-- SOLUTION: Remplacer "USING (true)" par "USING (auth.uid() = user_id)"

-- =====================================================
-- NOTES
-- =====================================================
DROP POLICY IF EXISTS "Users can view all notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Users can CRUD own notes"
  ON notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- EVENTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update events" ON events;
DROP POLICY IF EXISTS "Users can delete events" ON events;

CREATE POLICY "Users can CRUD own events"
  ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SHOPPING_ITEMS
-- =====================================================
DROP POLICY IF EXISTS "Users can view all shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Users can insert shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Users can update shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Users can delete shopping items" ON shopping_items;

CREATE POLICY "Users can CRUD own shopping items"
  ON shopping_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEALS
-- =====================================================
DROP POLICY IF EXISTS "Users can view all meals" ON meals;
DROP POLICY IF EXISTS "Users can insert meals" ON meals;
DROP POLICY IF EXISTS "Users can update meals" ON meals;
DROP POLICY IF EXISTS "Users can delete meals" ON meals;

CREATE POLICY "Users can CRUD own meals"
  ON meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TASKS
-- =====================================================
DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON tasks;

CREATE POLICY "Users can CRUD own tasks"
  ON tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FAVORITE_MEALS
-- =====================================================
DROP POLICY IF EXISTS "Enable all operations for all users" ON favorite_meals;

CREATE POLICY "Users can CRUD own favorite meals"
  ON favorite_meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FAMILY_MEMBERS
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view family members (temp)" ON family_members;
DROP POLICY IF EXISTS "Anyone can insert family members (temp)" ON family_members;
DROP POLICY IF EXISTS "Anyone can update family members (temp)" ON family_members;
DROP POLICY IF EXISTS "Anyone can delete family members (temp)" ON family_members;

CREATE POLICY "Users can CRUD own family members"
  ON family_members
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FILMS
-- =====================================================
DROP POLICY IF EXISTS "Enable all operations for all users" ON films;

CREATE POLICY "Users can CRUD own films"
  ON films
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIPS
-- =====================================================
DROP POLICY IF EXISTS "Enable all operations for all users" ON trips;

CREATE POLICY "Users can CRUD own trips"
  ON trips
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PACKING_ITEMS
-- =====================================================
DROP POLICY IF EXISTS "Enable all operations for all users" ON packing_items;

CREATE POLICY "Users can CRUD own packing items"
  ON packing_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que toutes les politiques RLS utilisent auth.uid()
SELECT
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '✅ Sécurisé'
    WHEN qual LIKE '%true%' THEN '❌ DANGEREUX - Accès total'
    ELSE '⚠️ À vérifier'
  END as security_status,
  qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'notes', 'events', 'shopping_items', 'meals', 'tasks',
    'favorite_meals', 'family_settings', 'family_members',
    'films', 'trips', 'packing_items'
  )
ORDER BY tablename, policyname;
