-- Supprimer toutes les données existantes
DELETE FROM packing_items;

-- Recréer des catégories avec des items propres pour une famille de 4 (2 adultes, enfants 3 ans et 1 an)

-- Catégorie: Documents
INSERT INTO packing_items (item, category, checked) VALUES
('Passeports/Cartes d''identité', 'Documents', false),
('Carnets de santé', 'Documents', false),
('Assurance voyage', 'Documents', false),
('Réservations (avion, hôtel, voiture)', 'Documents', false),
('Cartes bancaires', 'Documents', false);

-- Catégorie: Toilette Adultes
INSERT INTO packing_items (item, category, checked) VALUES
('Brosses à dents', 'Toilette Adultes', false),
('Dentifrice', 'Toilette Adultes', false),
('Shampoing', 'Toilette Adultes', false),
('Gel douche', 'Toilette Adultes', false),
('Déodorant', 'Toilette Adultes', false),
('Rasoir', 'Toilette Adultes', false),
('Crème solaire', 'Toilette Adultes', false),
('Crème hydratante', 'Toilette Adultes', false);

-- Catégorie: Toilette Enfants
INSERT INTO packing_items (item, category, checked) VALUES
('Brosse à dents enfant', 'Toilette Enfants', false),
('Dentifrice enfant', 'Toilette Enfants', false),
('Shampoing bébé', 'Toilette Enfants', false),
('Gel lavant bébé', 'Toilette Enfants', false),
('Crème change', 'Toilette Enfants', false),
('Lingettes', 'Toilette Enfants', false);

-- Catégorie: Pharmacie
INSERT INTO packing_items (item, category, checked) VALUES
('Doliprane enfant', 'Pharmacie', false),
('Doliprane adulte', 'Pharmacie', false),
('Thermomètre', 'Pharmacie', false),
('Pansements', 'Pharmacie', false),
('Désinfectant', 'Pharmacie', false),
('Anti-moustiques', 'Pharmacie', false),
('Sérum physiologique', 'Pharmacie', false);

-- Catégorie: Vêtements Adultes
INSERT INTO packing_items (item, category, checked) VALUES
('T-shirts', 'Vêtements Adultes', false),
('Pantalons/Shorts', 'Vêtements Adultes', false),
('Sous-vêtements', 'Vêtements Adultes', false),
('Chaussettes', 'Vêtements Adultes', false),
('Pull/Gilet', 'Vêtements Adultes', false),
('Veste', 'Vêtements Adultes', false),
('Maillot de bain', 'Vêtements Adultes', false),
('Pyjamas', 'Vêtements Adultes', false),
('Chaussures', 'Vêtements Adultes', false);

-- Catégorie: Vêtements Enfants
INSERT INTO packing_items (item, category, checked) VALUES
('Bodies (1 an)', 'Vêtements Enfants', false),
('T-shirts', 'Vêtements Enfants', false),
('Pantalons', 'Vêtements Enfants', false),
('Sous-vêtements', 'Vêtements Enfants', false),
('Chaussettes', 'Vêtements Enfants', false),
('Pull/Gilet', 'Vêtements Enfants', false),
('Veste', 'Vêtements Enfants', false),
('Pyjamas', 'Vêtements Enfants', false),
('Chaussures', 'Vêtements Enfants', false),
('Chapeau/Casquette', 'Vêtements Enfants', false);

-- Catégorie: Bébé (1 an)
INSERT INTO packing_items (item, category, checked) VALUES
('Couches', 'Bébé (1 an)', false),
('Lingettes', 'Bébé (1 an)', false),
('Biberons', 'Bébé (1 an)', false),
('Lait infantile', 'Bébé (1 an)', false),
('Petits pots', 'Bébé (1 an)', false),
('Bavoirs', 'Bébé (1 an)', false),
('Doudou', 'Bébé (1 an)', false),
('Tétine', 'Bébé (1 an)', false),
('Poussette', 'Bébé (1 an)', false),
('Porte-bébé', 'Bébé (1 an)', false);

-- Catégorie: Enfant (3 ans)
INSERT INTO packing_items (item, category, checked) VALUES
('Doudou', 'Enfant (3 ans)', false),
('Jouets favoris', 'Enfant (3 ans)', false),
('Livres', 'Enfant (3 ans)', false),
('Cahier de coloriage', 'Enfant (3 ans)', false),
('Crayons', 'Enfant (3 ans)', false),
('Gobelet', 'Enfant (3 ans)', false);

-- Catégorie: Tech
INSERT INTO packing_items (item, category, checked) VALUES
('Téléphones', 'Tech', false),
('Chargeurs', 'Tech', false),
('Adaptateurs secteur', 'Tech', false),
('Écouteurs', 'Tech', false),
('Appareil photo', 'Tech', false),
('Tablette enfant', 'Tech', false);

-- Catégorie: Divers
INSERT INTO packing_items (item, category, checked) VALUES
('Sac à dos', 'Divers', false),
('Bouteilles d''eau', 'Divers', false),
('Snacks voyage', 'Divers', false),
('Sacs plastique', 'Divers', false),
('Parapluie', 'Divers', false),
('Lunettes de soleil', 'Divers', false);

-- Catégorie: Avant de partir
INSERT INTO packing_items (item, category, checked) VALUES
('Fermer les fenêtres', 'Avant de partir', false),
('Couper l''eau', 'Avant de partir', false),
('Débrancher appareils', 'Avant de partir', false),
('Vider poubelles', 'Avant de partir', false),
('Programmer chauffage', 'Avant de partir', false),
('Arroser plantes', 'Avant de partir', false),
('Prévenir voisins', 'Avant de partir', false);
