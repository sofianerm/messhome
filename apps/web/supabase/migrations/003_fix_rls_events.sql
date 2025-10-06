-- ============================================
-- FIX RLS POUR EVENTS (TESTING SANS AUTH)
-- ============================================

-- Modifier la politique INSERT pour events
DROP POLICY IF EXISTS "Users can insert events" ON events;

CREATE POLICY "Anyone can insert events (temp)"
  ON events FOR INSERT
  WITH CHECK (true);

-- Modifier la politique UPDATE pour events
DROP POLICY IF EXISTS "Users can update their own events" ON events;

CREATE POLICY "Anyone can update events (temp)"
  ON events FOR UPDATE
  USING (true);

-- Modifier la politique DELETE pour events
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

CREATE POLICY "Anyone can delete events (temp)"
  ON events FOR DELETE
  USING (true);

-- Permettre les user_id NULL temporairement
ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;
