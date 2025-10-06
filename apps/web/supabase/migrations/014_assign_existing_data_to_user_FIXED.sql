-- Migration 014 FIXED: Assigner toutes les données existantes au premier utilisateur
-- À exécuter après avoir créé votre premier compte utilisateur

DO $$
DECLARE
  first_user_id UUID;
  rows_updated INTEGER;
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
  -- Seulement pour les tables qui ont la colonne user_id

  UPDATE shopping_items SET user_id = first_user_id WHERE user_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'shopping_items: % lignes mises à jour', rows_updated;

  UPDATE meals SET user_id = first_user_id WHERE user_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'meals: % lignes mises à jour', rows_updated;

  UPDATE events SET user_id = first_user_id WHERE user_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'events: % lignes mises à jour', rows_updated;

  UPDATE tasks SET user_id = first_user_id WHERE user_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'tasks: % lignes mises à jour', rows_updated;

  UPDATE notes SET user_id = first_user_id WHERE user_id IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'notes: % lignes mises à jour', rows_updated;

  -- Favorite meals (vérifier si existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorite_meals') THEN
    UPDATE favorite_meals SET user_id = first_user_id WHERE user_id IS NULL;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'favorite_meals: % lignes mises à jour', rows_updated;
  END IF;

  -- Family members (a déjà user_id mais peut être NULL)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'family_members') THEN
    UPDATE family_members SET user_id = first_user_id WHERE user_id IS NULL;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'family_members: % lignes mises à jour', rows_updated;
  END IF;

  -- Films (vérifier si existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'films') THEN
    UPDATE films SET user_id = first_user_id WHERE user_id IS NULL;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'films: % lignes mises à jour', rows_updated;
  END IF;

  -- Trips (vérifier si existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') THEN
    UPDATE trips SET user_id = first_user_id WHERE user_id IS NULL;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'trips: % lignes mises à jour', rows_updated;
  END IF;

  -- Packing items (vérifier si existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'packing_items') THEN
    UPDATE packing_items SET user_id = first_user_id WHERE user_id IS NULL;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'packing_items: % lignes mises à jour', rows_updated;
  END IF;

  -- NOTE: family_settings n'a PAS de user_id par design (paramètres globaux)

  -- Afficher le résumé
  RAISE NOTICE 'Migration terminée avec succès !';
END $$;

-- Vérifier le résultat
SELECT
  'shopping_items' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as with_user_id
FROM shopping_items
UNION ALL
SELECT 'meals', COUNT(*), COUNT(*) FILTER (WHERE user_id IS NOT NULL) FROM meals
UNION ALL
SELECT 'events', COUNT(*), COUNT(*) FILTER (WHERE user_id IS NOT NULL) FROM events
UNION ALL
SELECT 'tasks', COUNT(*), COUNT(*) FILTER (WHERE user_id IS NOT NULL) FROM tasks
UNION ALL
SELECT 'notes', COUNT(*), COUNT(*) FILTER (WHERE user_id IS NOT NULL) FROM notes;
