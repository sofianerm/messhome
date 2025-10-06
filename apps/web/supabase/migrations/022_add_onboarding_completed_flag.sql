-- Migration 022: Ajouter flag onboarding_completed pour détecter première connexion

-- Ajouter la colonne onboarding_completed à family_settings
ALTER TABLE family_settings
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Mettre à jour les settings existants (déjà configurés) comme complétés
UPDATE family_settings
SET onboarding_completed = true
WHERE family_name IS NOT NULL AND family_name != '';

-- Vérification
SELECT
  id,
  family_name,
  onboarding_completed,
  created_at
FROM family_settings
ORDER BY created_at DESC;
