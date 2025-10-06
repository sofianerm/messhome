-- Ajouter une colonne order pour l'ordre des catégories
ALTER TABLE packing_items ADD COLUMN category_order INTEGER DEFAULT 0;

-- Index pour les tris par ordre
CREATE INDEX packing_items_category_order_idx ON packing_items(category_order);

-- Mettre à jour l'ordre existant (ordre alphabétique par défaut)
WITH category_order AS (
  SELECT DISTINCT category, ROW_NUMBER() OVER (ORDER BY category) as ord
  FROM packing_items
  WHERE category IS NOT NULL
)
UPDATE packing_items
SET category_order = category_order.ord
FROM category_order
WHERE packing_items.category = category_order.category;
