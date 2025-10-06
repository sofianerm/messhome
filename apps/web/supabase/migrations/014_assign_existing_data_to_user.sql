-- Migration 014: Assigner toutes les données existantes au premier utilisateur
-- À exécuter après avoir créé votre premier compte utilisateur

-- 1. Récupérer l'ID du premier utilisateur (celui que vous venez de créer)
-- Remplacer 'VOTRE_EMAIL@example.com' par votre email d'inscription

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Récupérer le premier utilisateur créé
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  -- Si aucun utilisateur trouvé, afficher une erreur
  IF first_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur trouvé. Créez d''abord un compte.';
  END IF;

  -- Afficher l'ID utilisateur
  RAISE NOTICE 'Attribution des données à l''utilisateur: %', first_user_id;

  -- Assigner toutes les données existantes (où user_id est NULL) à cet utilisateur
  UPDATE shopping_items SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE meals SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE events SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE tasks SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE notes SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE favorite_meals SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE family_settings SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE family_members SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE films SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE trips SET user_id = first_user_id WHERE user_id IS NULL;
  UPDATE packing_items SET user_id = first_user_id WHERE user_id IS NULL;

  -- Afficher le résumé
  RAISE NOTICE 'Migration terminée avec succès !';
END $$;

-- Vérifier le résultat
SELECT
  'shopping_items' as table_name, COUNT(*) as count FROM shopping_items WHERE user_id IS NOT NULL
UNION ALL
SELECT 'meals', COUNT(*) FROM meals WHERE user_id IS NOT NULL
UNION ALL
SELECT 'events', COUNT(*) FROM events WHERE user_id IS NOT NULL
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE user_id IS NOT NULL
UNION ALL
SELECT 'notes', COUNT(*) FROM notes WHERE user_id IS NOT NULL
UNION ALL
SELECT 'favorite_meals', COUNT(*) FROM favorite_meals WHERE user_id IS NOT NULL
UNION ALL
SELECT 'family_settings', COUNT(*) FROM family_settings WHERE user_id IS NOT NULL
UNION ALL
SELECT 'family_members', COUNT(*) FROM family_members WHERE user_id IS NOT NULL
UNION ALL
SELECT 'films', COUNT(*) FROM films WHERE user_id IS NOT NULL
UNION ALL
SELECT 'trips', COUNT(*) FROM trips WHERE user_id IS NOT NULL
UNION ALL
SELECT 'packing_items', COUNT(*) FROM packing_items WHERE user_id IS NOT NULL;
