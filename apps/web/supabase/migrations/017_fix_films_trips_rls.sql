-- Migration 017: Corriger les politiques RLS pour films et trips
-- La migration 016 n'a pas supprimé ces politiques car les noms ne correspondaient pas

-- =====================================================
-- FILMS - Supprimer les anciennes politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can insert films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can update films (temp)" ON films;
DROP POLICY IF EXISTS "Anyone can delete films (temp)" ON films;

-- Créer la nouvelle politique sécurisée
CREATE POLICY "Users can CRUD own films"
  ON films
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIPS - Supprimer les anciennes politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can insert trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can update trips (temp)" ON trips;
DROP POLICY IF EXISTS "Anyone can delete trips (temp)" ON trips;

-- Créer la nouvelle politique sécurisée
CREATE POLICY "Users can CRUD own trips"
  ON trips
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PACKING_ITEMS - Supprimer les anciennes politiques
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can insert packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can update packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can delete packing items (temp)" ON packing_items;

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
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('films', 'trips', 'packing_items')
ORDER BY tablename, policyname;
