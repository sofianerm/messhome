-- ============================================
-- TABLE: films (Filmographie)
-- ============================================

CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  genre TEXT,
  annee INTEGER,
  duree INTEGER, -- en minutes
  note INTEGER CHECK (note >= 0 AND note <= 5), -- Note sur 5 étoiles
  statut TEXT CHECK (statut IN ('a-voir', 'en-cours', 'vu')) DEFAULT 'a-voir',
  date_vue DATE,
  commentaire TEXT,
  poster TEXT, -- URL du poster TMDB
  tmdb_id INTEGER, -- ID TMDB pour référence
  overview TEXT, -- Synopsis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX films_user_id_idx ON films(user_id);
CREATE INDEX films_statut_idx ON films(statut);
CREATE INDEX films_note_idx ON films(note);
CREATE INDEX films_annee_idx ON films(annee);

-- RLS
ALTER TABLE films ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view films (temp)"
  ON films FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert films (temp)"
  ON films FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update films (temp)"
  ON films FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete films (temp)"
  ON films FOR DELETE
  USING (true);

-- Permettre user_id NULL temporairement
ALTER TABLE films ALTER COLUMN user_id DROP NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_films_updated_at BEFORE UPDATE ON films
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
