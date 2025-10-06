-- ============================================
-- Mise à jour des types d'événements
-- ============================================

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;

-- Ajouter la nouvelle contrainte avec tous les types
ALTER TABLE events ADD CONSTRAINT events_type_check
  CHECK (type IN ('rdv', 'anniversaire', 'ecole', 'sport', 'vacances', 'reunion', 'sante', 'autre'));
