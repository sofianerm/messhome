-- Migration 015: Ajouter user_id à family_settings et mettre à jour les RLS
-- Chaque utilisateur doit avoir ses propres paramètres familiaux

-- 1. Ajouter la colonne user_id
ALTER TABLE family_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Créer un index
CREATE INDEX IF NOT EXISTS family_settings_user_id_idx ON family_settings(user_id);

-- 3. Assigner les données existantes au premier utilisateur
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF first_user_id IS NOT NULL THEN
    UPDATE family_settings
    SET user_id = first_user_id
    WHERE user_id IS NULL;

    RAISE NOTICE 'family_settings assignés à l''utilisateur: %', first_user_id;
  END IF;
END $$;

-- 4. Supprimer les anciennes politiques RLS "temp"
DROP POLICY IF EXISTS "Anyone can view family settings (temp)" ON family_settings;
DROP POLICY IF EXISTS "Anyone can insert family settings (temp)" ON family_settings;
DROP POLICY IF EXISTS "Anyone can update family settings (temp)" ON family_settings;
DROP POLICY IF EXISTS "Anyone can delete family settings (temp)" ON family_settings;

-- 5. Créer les nouvelles politiques RLS basées sur user_id
CREATE POLICY "Users can CRUD own family settings"
  ON family_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Vérifier le résultat
SELECT
  id,
  family_name,
  user_id,
  CASE
    WHEN user_id IS NOT NULL THEN '✅ OK'
    ELSE '❌ NULL'
  END as status
FROM family_settings;
