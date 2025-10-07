-- Migration 023: Debug family_settings - Vérifier les données et RLS

-- 1. Voir toutes les lignes family_settings avec leurs user_id
SELECT
  id,
  family_name,
  user_id,
  onboarding_completed,
  created_at,
  CASE
    WHEN user_id IS NULL THEN '❌ NULL user_id'
    ELSE '✅ OK'
  END as status
FROM family_settings
ORDER BY created_at DESC;

-- 2. Voir tous les users auth
SELECT
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Vérifier les politiques RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'family_settings';
