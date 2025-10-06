-- Migration 013 FIX: Ajouter les colonnes manquantes à la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr-FR';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Zurich';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Vérifier que toutes les colonnes existent
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
