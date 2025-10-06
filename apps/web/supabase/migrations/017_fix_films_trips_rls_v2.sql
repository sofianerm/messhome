-- Migration 017 V2: Corriger les politiques RLS pour films et trips
-- Supprime TOUTES les politiques existantes puis recrée les bonnes

-- =====================================================
-- FILMS - Supprimer TOUTES les politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can insert films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can update films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can delete films (temp)" ON films;
DROP POLICY IF EXISTS "Enable all operations for all users" ON films;
DROP POLICY IF EXISTS "Users can CRUD own films" ON films;

-- Créer la nouvelle politique sécurisée
CREATE POLICY "Users can CRUD own films"
  ON films
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIPS - Supprimer TOUTES les politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can insert trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can update trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can delete trips (temp)" ON trips;
DROP POLICY IF EXISTS "Enable all operations for all users" ON trips;
DROP POLICY IF EXISTS "Users can CRUD own trips" ON trips;

-- Créer la nouvelle politique sécurisée
CREATE POLICY "Users can CRUD own trips"
  ON trips
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PACKING_ITEMS - Supprimer TOUTES les politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can insert packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can update packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can delete packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Enable all operations for all users" ON packing_items;
DROP POLICY IF EXISTS "Users can CRUD own packing items" ON packing_items;

-- Créer la nouvelle politique sécurisée
CREATE POLICY "Users can CRUD own packing items"
  ON packing_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================
SELECT
  tablename,
  policyname,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '✅ Sécurisé'
    WHEN qual LIKE '%true%' THEN '❌ DANGEREUX'
    ELSE '⚠️ À vérifier'
  END as status,
  qual as policy
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('films', 'trips', 'packing_items')
ORDER BY tablename, policyname;
