-- Migration 024: Configuration JWT et session
-- Note: Les paramètres JWT se configurent via Dashboard > Settings > Auth
-- Cette migration documente les valeurs recommandées

-- Vérifier les settings actuels (à exécuter manuellement dans le dashboard)
-- Dashboard > Settings > Auth > JWT Settings

/*
PARAMÈTRES RECOMMANDÉS:

1. JWT Expiry: 86400 (24 heures au lieu de 1 heure)
   - Par défaut: 3600 secondes (1 heure) - trop court
   - Recommandé: 86400 secondes (24 heures)
   - Maximum: 604800 secondes (7 jours)

2. Refresh Token Reuse Interval: 10
   - Temps minimum entre deux refresh (en secondes)
   - Évite les refresh trop fréquents

3. Session Idle Timeout: 86400 (24 heures)
   - Temps d'inactivité avant déconnexion automatique

COMMENT CHANGER:
1. Aller dans Supabase Dashboard
2. Project Settings (roue dentée en bas gauche)
3. Auth section
4. JWT Settings
5. Changer "JWT Expiry" de 3600 à 86400
6. Sauvegarder
*/

-- Info: Ce fichier est documentaire uniquement
-- Les settings JWT ne peuvent être modifiés que via le Dashboard Supabase
SELECT 'JWT settings must be configured in Supabase Dashboard > Settings > Auth > JWT Settings' as info;
