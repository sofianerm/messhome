-- ============================================
-- FIX RLS POUR TESTING SANS AUTH
-- ============================================
-- NOTE: Ceci est temporaire pour le développement
-- À remplacer par une vraie auth plus tard

-- Modifier la politique INSERT pour notes
-- Autoriser l'insertion sans vérifier l'auth (temporaire)
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;

CREATE POLICY "Anyone can insert notes (temp)"
  ON notes FOR INSERT
  WITH CHECK (true);

-- Modifier la politique UPDATE pour notes
-- Autoriser la modification sans vérifier l'auth (temporaire)
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;

CREATE POLICY "Anyone can update notes (temp)"
  ON notes FOR UPDATE
  USING (true);

-- Modifier la politique DELETE pour notes
-- Autoriser la suppression sans vérifier l'auth (temporaire)
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

CREATE POLICY "Anyone can delete notes (temp)"
  ON notes FOR DELETE
  USING (true);

-- Permettre les user_id NULL temporairement
ALTER TABLE notes ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- NOTE IMPORTANTE
-- ============================================
-- Ces politiques sont TEMPORAIRES pour le développement.
-- Quand l'authentification sera ajoutée, on remettra
-- les politiques strictes avec auth.uid()
