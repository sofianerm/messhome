-- ============================================
-- TABLE: family_settings (Paramètres famille)
-- ============================================

CREATE TABLE IF NOT EXISTS family_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_name TEXT NOT NULL DEFAULT 'Ma Famille',
  home_address TEXT,
  family_photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX family_settings_family_name_idx ON family_settings(family_name);

-- RLS
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view family settings (temp)"
  ON family_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert family settings (temp)"
  ON family_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update family settings (temp)"
  ON family_settings FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete family settings (temp)"
  ON family_settings FOR DELETE
  USING (true);

-- Trigger auto-update
CREATE TRIGGER update_family_settings_updated_at BEFORE UPDATE ON family_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer un paramétrage par défaut
INSERT INTO family_settings (family_name) VALUES ('Famille Messaoudi')
ON CONFLICT DO NOTHING;

-- ============================================
-- TABLE: family_members (Membres de la famille)
-- ============================================

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('papa', 'maman', 'enfant', 'autre')),
  birth_date DATE,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  color TEXT DEFAULT '#2563FF', -- Couleur pour l'affichage
  allergies TEXT, -- Allergies alimentaires
  dietary_preferences TEXT, -- Préférences alimentaires (végétarien, etc.)
  whatsapp_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX family_members_user_id_idx ON family_members(user_id);
CREATE INDEX family_members_role_idx ON family_members(role);

-- RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view family members (temp)"
  ON family_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert family members (temp)"
  ON family_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update family members (temp)"
  ON family_members FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete family members (temp)"
  ON family_members FOR DELETE
  USING (true);

-- Permettre user_id NULL temporairement
ALTER TABLE family_members ALTER COLUMN user_id DROP NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
