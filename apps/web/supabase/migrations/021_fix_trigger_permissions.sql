-- Migration 021: Corriger les permissions des triggers pour création utilisateur
-- PROBLÈME: Les triggers échouent à cause de RLS lors de la création d'utilisateur

-- =====================================================
-- 1. Recréer handle_new_user avec SECURITY DEFINER
-- =====================================================

-- Ce trigger crée le profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- Exécute avec les droits du créateur de la fonction (postgres)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
    RETURN NEW; -- Continue même en cas d'erreur
END;
$$;

-- =====================================================
-- 2. Recréer create_default_packing_items_for_user
-- =====================================================

-- Ce trigger crée la checklist voyage lors de la création du profil
CREATE OR REPLACE FUNCTION public.create_default_packing_items_for_user()
RETURNS TRIGGER
SECURITY DEFINER -- Exécute avec les droits du créateur (bypass RLS)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Copier tous les items par défaut pour le nouvel utilisateur
  INSERT INTO packing_items (user_id, item, category, checked, category_order)
  SELECT
    NEW.id,
    item,
    category,
    false,
    display_order
  FROM default_packing_items
  ORDER BY display_order;

  RAISE NOTICE 'Checklist voyage créée pour utilisateur: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de la création de la checklist: %', SQLERRM;
    RETURN NEW; -- Continue même en cas d'erreur
END;
$$;

-- =====================================================
-- 3. Vérifier que les triggers existent
-- =====================================================

SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name,
  prosecdef as security_definer
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname IN ('on_auth_user_created', 'create_packing_items_on_user_signup')
ORDER BY tgname;

-- =====================================================
-- 4. Tester la création d'un profil manuellement (OPTIONNEL)
-- =====================================================

-- Pour tester, décommentez et remplacez l'UUID par un faux ID:
-- DO $$
-- DECLARE
--   test_user_id UUID := gen_random_uuid();
-- BEGIN
--   -- Simuler la création d'un profil
--   INSERT INTO profiles (id, email, full_name)
--   VALUES (test_user_id, 'test@example.com', 'Test User');
--
--   -- Vérifier que la checklist a été créée
--   RAISE NOTICE 'Items créés: %', (SELECT COUNT(*) FROM packing_items WHERE user_id = test_user_id);
--
--   -- Nettoyer
--   DELETE FROM packing_items WHERE user_id = test_user_id;
--   DELETE FROM profiles WHERE id = test_user_id;
-- END $$;
