-- Migration 025: Debug et fix du flag onboarding_completed

-- 1. Voir l'état actuel pour cet utilisateur
SELECT
  id,
  user_id,
  family_name,
  onboarding_completed,
  created_at
FROM family_settings
WHERE user_id = '4bcec78a-50aa-4006-b64d-bd5123081e6e';

-- 2. Si onboarding_completed est NULL ou FALSE, le mettre à TRUE
UPDATE family_settings
SET onboarding_completed = true
WHERE user_id = '4bcec78a-50aa-4006-b64d-bd5123081e6e'
  AND (onboarding_completed IS NULL OR onboarding_completed = false);

-- 3. Vérifier le résultat
SELECT
  id,
  user_id,
  family_name,
  onboarding_completed,
  created_at
FROM family_settings
WHERE user_id = '4bcec78a-50aa-4006-b64d-bd5123081e6e';
