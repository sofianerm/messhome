-- Migration 018: Créer automatiquement une checklist voyage par défaut pour chaque utilisateur

-- =====================================================
-- 1. TABLE: default_packing_items (Template de base)
-- =====================================================
CREATE TABLE IF NOT EXISTS default_packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer la liste par défaut (depuis migration 011)
INSERT INTO default_packing_items (item, category, display_order) VALUES
-- Documents
('Passeports/Cartes d''identité', 'Documents', 1),
('Carnets de santé', 'Documents', 2),
('Assurance voyage', 'Documents', 3),
('Réservations (avion, hôtel, voiture)', 'Documents', 4),
('Cartes bancaires', 'Documents', 5),

-- Toilette Adultes
('Brosses à dents', 'Toilette Adultes', 10),
('Dentifrice', 'Toilette Adultes', 11),
('Shampoing', 'Toilette Adultes', 12),
('Gel douche', 'Toilette Adultes', 13),
('Déodorant', 'Toilette Adultes', 14),
('Rasoir', 'Toilette Adultes', 15),
('Crème solaire', 'Toilette Adultes', 16),
('Crème hydratante', 'Toilette Adultes', 17),

-- Toilette Enfants
('Brosse à dents enfant', 'Toilette Enfants', 20),
('Dentifrice enfant', 'Toilette Enfants', 21),
('Shampoing bébé', 'Toilette Enfants', 22),
('Gel lavant bébé', 'Toilette Enfants', 23),
('Crème change', 'Toilette Enfants', 24),
('Lingettes', 'Toilette Enfants', 25),

-- Pharmacie
('Doliprane enfant', 'Pharmacie', 30),
('Doliprane adulte', 'Pharmacie', 31),
('Thermomètre', 'Pharmacie', 32),
('Pansements', 'Pharmacie', 33),
('Désinfectant', 'Pharmacie', 34),
('Anti-moustiques', 'Pharmacie', 35),
('Sérum physiologique', 'Pharmacie', 36),

-- Vêtements Adultes
('T-shirts', 'Vêtements Adultes', 40),
('Pantalons/Shorts', 'Vêtements Adultes', 41),
('Sous-vêtements', 'Vêtements Adultes', 42),
('Chaussettes', 'Vêtements Adultes', 43),
('Pull/Gilet', 'Vêtements Adultes', 44),
('Veste', 'Vêtements Adultes', 45),
('Maillot de bain', 'Vêtements Adultes', 46),
('Pyjamas', 'Vêtements Adultes', 47),
('Chaussures', 'Vêtements Adultes', 48),

-- Vêtements Enfants
('Bodies (1 an)', 'Vêtements Enfants', 50),
('T-shirts', 'Vêtements Enfants', 51),
('Pantalons', 'Vêtements Enfants', 52),
('Sous-vêtements', 'Vêtements Enfants', 53),
('Chaussettes', 'Vêtements Enfants', 54),
('Pull/Gilet', 'Vêtements Enfants', 55),
('Veste', 'Vêtements Enfants', 56),
('Pyjamas', 'Vêtements Enfants', 57),
('Chaussures', 'Vêtements Enfants', 58),
('Chapeau/Casquette', 'Vêtements Enfants', 59),

-- Bébé (1 an)
('Couches', 'Bébé (1 an)', 60),
('Lingettes', 'Bébé (1 an)', 61),
('Biberons', 'Bébé (1 an)', 62),
('Lait infantile', 'Bébé (1 an)', 63),
('Petits pots', 'Bébé (1 an)', 64),
('Bavoirs', 'Bébé (1 an)', 65),
('Doudou', 'Bébé (1 an)', 66),
('Tétine', 'Bébé (1 an)', 67),
('Poussette', 'Bébé (1 an)', 68),
('Porte-bébé', 'Bébé (1 an)', 69),

-- Enfant (3 ans)
('Doudou', 'Enfant (3 ans)', 70),
('Jouets favoris', 'Enfant (3 ans)', 71),
('Livres', 'Enfant (3 ans)', 72),
('Cahier de coloriage', 'Enfant (3 ans)', 73),
('Crayons', 'Enfant (3 ans)', 74),
('Gobelet', 'Enfant (3 ans)', 75),

-- Tech
('Téléphones', 'Tech', 80),
('Chargeurs', 'Tech', 81),
('Adaptateurs secteur', 'Tech', 82),
('Écouteurs', 'Tech', 83),
('Appareil photo', 'Tech', 84),
('Tablette enfant', 'Tech', 85),

-- Divers
('Sac à dos', 'Divers', 90),
('Bouteilles d''eau', 'Divers', 91),
('Snacks voyage', 'Divers', 92),
('Sacs plastique', 'Divers', 93),
('Parapluie', 'Divers', 94),
('Lunettes de soleil', 'Divers', 95),

-- Avant de partir
('Fermer les fenêtres', 'Avant de partir', 100),
('Couper l''eau', 'Avant de partir', 101),
('Débrancher appareils', 'Avant de partir', 102),
('Vider poubelles', 'Avant de partir', 103),
('Programmer chauffage', 'Avant de partir', 104),
('Arroser plantes', 'Avant de partir', 105),
('Prévenir voisins', 'Avant de partir', 106)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. TRIGGER: Copier la liste par défaut pour chaque nouvel utilisateur
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_default_packing_items_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Copier tous les items par défaut pour le nouvel utilisateur
  INSERT INTO packing_items (user_id, item, category, checked, category_order)
  SELECT
    NEW.id,
    item,
    category,
    false, -- tous non cochés par défaut
    display_order
  FROM default_packing_items
  ORDER BY display_order;

  RAISE NOTICE 'Checklist voyage créée pour l''utilisateur: %', NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la création d'un profil (après inscription)
DROP TRIGGER IF EXISTS create_packing_items_on_user_signup ON profiles;
CREATE TRIGGER create_packing_items_on_user_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_packing_items_for_user();

-- =====================================================
-- 3. Créer la liste pour les utilisateurs existants
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  items_count INTEGER;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Vérifier si l'utilisateur a déjà des items
    SELECT COUNT(*) INTO items_count
    FROM packing_items
    WHERE user_id = user_record.id;

    IF items_count = 0 THEN
      -- Créer la liste par défaut
      INSERT INTO packing_items (user_id, item, category, checked, category_order)
      SELECT
        user_record.id,
        item,
        category,
        false,
        display_order
      FROM default_packing_items
      ORDER BY display_order;

      RAISE NOTICE 'Checklist créée pour utilisateur existant: %', user_record.id;
    ELSE
      RAISE NOTICE 'Utilisateur % a déjà % items', user_record.id, items_count;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. VÉRIFICATION
-- =====================================================

SELECT
  u.email,
  COUNT(pi.id) as nb_items
FROM auth.users u
LEFT JOIN packing_items pi ON pi.user_id = u.id
GROUP BY u.id, u.email
ORDER BY u.created_at;
