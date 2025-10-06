-- Ajouter une colonne category à packing_items
ALTER TABLE packing_items ADD COLUMN category TEXT;

-- Index pour les recherches par catégorie
CREATE INDEX packing_items_category_idx ON packing_items(category);

-- Migrer les données existantes (extraire la catégorie du format [Catégorie] Item)
UPDATE packing_items
SET category = substring(item from '\[([^\]]+)\]')
WHERE item ~ '^\[[^\]]+\]';

-- Nettoyer le texte des items (enlever [Catégorie] du début)
UPDATE packing_items
SET item = regexp_replace(item, '^\[[^\]]+\]\s*', '')
WHERE item ~ '^\[[^\]]+\]';
