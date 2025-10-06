-- Migration 020: ACTIVER RLS sur packing_items (CRITIQUE)
-- PROBLÈME: RLS désactivé = tous les utilisateurs voient toutes les checklists !

-- =====================================================
-- ACTIVER RLS sur packing_items
-- =====================================================

ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques temporaires si elles existent encore
DROP POLICY IF EXISTS "Anyone can view packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can insert packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can update packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Anyone can delete packing items (temp)" ON packing_items;
DROP POLICY IF EXISTS "Enable all operations for all users" ON packing_items;
DROP POLICY IF EXISTS "Users can CRUD own packing items" ON packing_items;

-- Créer la politique sécurisée
CREATE POLICY "Users can CRUD own packing items"
  ON packing_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- 1. Vérifier que RLS est activé
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('packing_items', 'default_packing_items')
ORDER BY tablename;

-- 2. Vérifier les politiques
SELECT
  tablename,
  policyname,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '✅ Sécurisé par user_id'
    WHEN qual LIKE '%true%' AND cmd = 'SELECT' THEN '✅ Lecture publique (OK pour templates)'
    WHEN qual LIKE '%true%' THEN '❌ DANGEREUX - Accès total'
    ELSE '⚠️ À vérifier'
  END as security_status,
  cmd as operation,
  qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('packing_items', 'default_packing_items')
ORDER BY tablename, policyname;
