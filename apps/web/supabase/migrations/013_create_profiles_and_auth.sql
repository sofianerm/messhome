-- Migration 013: Créer table profiles et setup authentification
-- Auteur: Claude Code
-- Date: 2025-10-06

-- =====================================================
-- 1. TABLE PROFILES (Extension de auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Préférences utilisateur
  locale TEXT DEFAULT 'fr-FR',
  timezone TEXT DEFAULT 'Europe/Zurich',

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- =====================================================
-- 2. TRIGGER AUTO-CREATE PROFILE
-- =====================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. FUNCTION UPDATE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Les utilisateurs peuvent insérer leur propre profil (via trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 5. LIER TOUTES LES TABLES EXISTANTES À auth.uid()
-- =====================================================

-- Ajouter colonne user_id à toutes les tables si elle n'existe pas
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE favorite_meals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE family_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE films ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer index sur user_id pour toutes les tables
CREATE INDEX IF NOT EXISTS shopping_items_user_id_idx ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS favorite_meals_user_id_idx ON favorite_meals(user_id);
CREATE INDEX IF NOT EXISTS family_settings_user_id_idx ON family_settings(user_id);
CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON family_members(user_id);
CREATE INDEX IF NOT EXISTS films_user_id_idx ON films(user_id);
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS packing_items_user_id_idx ON packing_items(user_id);

-- =====================================================
-- 6. METTRE À JOUR LES RLS POLICIES (auth.uid())
-- =====================================================

-- Shopping Items
DROP POLICY IF EXISTS "Enable all operations for all users" ON shopping_items;
CREATE POLICY "Users can CRUD own shopping items"
  ON shopping_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meals
DROP POLICY IF EXISTS "Enable all operations for all users" ON meals;
CREATE POLICY "Users can CRUD own meals"
  ON meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events
DROP POLICY IF EXISTS "Enable all operations for all users" ON events;
CREATE POLICY "Users can CRUD own events"
  ON events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks
DROP POLICY IF EXISTS "Enable all operations for all users" ON tasks;
CREATE POLICY "Users can CRUD own tasks"
  ON tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notes
DROP POLICY IF EXISTS "Enable all operations for all users" ON notes;
CREATE POLICY "Users can CRUD own notes"
  ON notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorite Meals
DROP POLICY IF EXISTS "Enable all operations for all users" ON favorite_meals;
CREATE POLICY "Users can CRUD own favorite meals"
  ON favorite_meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Family Settings
DROP POLICY IF EXISTS "Enable all operations for all users" ON family_settings;
CREATE POLICY "Users can CRUD own family settings"
  ON family_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Family Members
DROP POLICY IF EXISTS "Enable all operations for all users" ON family_members;
CREATE POLICY "Users can CRUD own family members"
  ON family_members
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Films
DROP POLICY IF EXISTS "Enable all operations for all users" ON films;
CREATE POLICY "Users can CRUD own films"
  ON films
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trips
DROP POLICY IF EXISTS "Enable all operations for all users" ON trips;
CREATE POLICY "Users can CRUD own trips"
  ON trips
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Packing Items
DROP POLICY IF EXISTS "Enable all operations for all users" ON packing_items;
CREATE POLICY "Users can CRUD own packing items"
  ON packing_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. COMMENTAIRES
-- =====================================================

COMMENT ON TABLE profiles IS 'Profils utilisateurs étendus (complète auth.users)';
COMMENT ON COLUMN profiles.id IS 'Référence à auth.users(id)';
COMMENT ON COLUMN profiles.locale IS 'Langue préférée (fr-FR, en-US, etc.)';
COMMENT ON COLUMN profiles.timezone IS 'Fuseau horaire (Europe/Zurich, etc.)';
