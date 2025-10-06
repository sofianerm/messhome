-- ============================================
-- TABLE: trips (Voyages)
-- ============================================

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS packing_items CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  type TEXT CHECK (type IN ('voyage', 'weekend')) DEFAULT 'voyage',
  status TEXT CHECK (status IN ('idea', 'planned', 'booked', 'done')) DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX trips_user_id_idx ON trips(user_id);
CREATE INDEX trips_start_date_idx ON trips(start_date);
CREATE INDEX trips_status_idx ON trips(status);

-- RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trips (temp)"
  ON trips FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert trips (temp)"
  ON trips FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update trips (temp)"
  ON trips FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete trips (temp)"
  ON trips FOR DELETE
  USING (true);

-- Permettre user_id NULL temporairement
ALTER TABLE trips ALTER COLUMN user_id DROP NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE trips;

-- ============================================
-- TABLE: packing_items (Checklist valise)
-- ============================================

CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX packing_items_user_id_idx ON packing_items(user_id);
CREATE INDEX packing_items_checked_idx ON packing_items(checked);

-- RLS
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packing items (temp)"
  ON packing_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert packing items (temp)"
  ON packing_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update packing items (temp)"
  ON packing_items FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete packing items (temp)"
  ON packing_items FOR DELETE
  USING (true);

-- Permettre user_id NULL temporairement
ALTER TABLE packing_items ALTER COLUMN user_id DROP NOT NULL;

-- Trigger auto-update
CREATE TRIGGER update_packing_items_updated_at BEFORE UPDATE ON packing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE packing_items;
