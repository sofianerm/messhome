-- Migration 019: Ajouter RLS pour default_packing_items

-- =====================================================
-- TABLE: default_packing_items - Lecture seule pour tous
-- =====================================================

ALTER TABLE default_packing_items ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire la liste template (lecture seule)
CREATE POLICY "Everyone can view default packing items"
  ON default_packing_items
  FOR SELECT
  USING (true);

-- Politique: Seuls les admins peuvent modifier (pour l'instant personne)
-- On pourrait ajouter un rôle admin plus tard si besoin

-- =====================================================
-- VÉRIFICATION: Toutes les tables packing ont bien RLS
-- =====================================================

SELECT
  tablename,
  policyname,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '✅ Sécurisé par user_id'
    WHEN qual LIKE '%true%' AND cmd = 'SELECT' THEN '✅ Lecture publique (OK pour templates)'
    WHEN qual LIKE '%true%' THEN '❌ DANGEREUX - Accès total'
    ELSE '⚠️ À vérifier'
  END as security_status,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('packing_items', 'default_packing_items')
ORDER BY tablename, policyname;
