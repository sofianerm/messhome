# Sécurité - Dashboard Familial

## 🔐 Clés API Sécurisées

### Configuration des Variables d'Environnement

Les clés API sont maintenant stockées dans des variables d'environnement pour éviter leur exposition dans le code.

#### Fichiers de configuration :
- `.env` - Variables d'environnement locales (ignoré par Git)
- `.env.example` - Template pour les autres développeurs

### Clés API Actuelles

#### 1. Google Maps Distance Matrix API
- **Variable** : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Usage** : Calcul des temps de trajet en voiture avec trafic en temps réel
- **Sécurisation** :
  - ✅ Stockée dans `.env`
  - ✅ Accessible côté serveur uniquement via la route proxy `/api/distance-matrix`
  - ✅ Non exposée au client

**Fichiers modifiés** :
- `apps/web/src/app/api/distance-matrix/route.js` - Route proxy sécurisée
- `apps/web/src/components/sections/Transport.jsx` - Client mis à jour (clé retirée)

#### 2. MasjidBox Prayer Times API
- **Variable** : `VITE_MASJIDBOX_API_KEY`
- **Usage** : Récupération des heures de prière
- **Sécurisation** :
  - ✅ Stockée dans `.env`
  - ⚠️ Accessible côté client (VITE_ prefix)
  - 🔜 TODO : Créer une route proxy côté serveur

**Fichiers modifiés** :
- `apps/web/src/components/sections/VueGenerale.jsx` - Utilise maintenant la variable d'env

#### 3. APIs Publiques (pas de clé requise)
- **Open-Meteo** - Données météo (publique)
- **CFF Transport Opendata** - Horaires trains (publique)

### 🚀 Setup pour Développement

1. Copier le fichier template :
   ```bash
   cp .env.example .env
   ```

2. Remplacer les valeurs dans `.env` :
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_google_maps
   VITE_MASJIDBOX_API_KEY=votre_clé_masjidbox
   ```

3. Redémarrer le serveur de dev :
   ```bash
   npm run dev
   ```

### 🔒 Bonnes Pratiques

#### ✅ À FAIRE :
- Toujours stocker les clés dans `.env`
- Utiliser des routes API proxy pour les appels serveur
- Ne jamais commit le fichier `.env`
- Utiliser `NEXT_PUBLIC_` uniquement si la clé DOIT être exposée au client
- Mettre à jour `.env.example` quand on ajoute une nouvelle clé

#### ❌ À NE PAS FAIRE :
- Hard-coder des clés dans le code source
- Exposer des clés dans les logs
- Partager `.env` dans Git, Slack, email, etc.
- Utiliser des clés de production en développement

### 🔜 Prochaines Étapes de Sécurisation

1. **Créer une route proxy pour MasjidBox API**
   - Déplacer la clé côté serveur
   - Route : `/api/prayer-times`

2. **Rate Limiting**
   - Limiter les appels API depuis le frontend
   - Protection contre les abus

3. **Supabase Integration**
   - Row Level Security (RLS)
   - Authentification utilisateur
   - Gestion des permissions

4. **Rotation des Clés**
   - Procédure de rotation régulière
   - Multi-environnements (dev/staging/prod)

### 📝 Notes Importantes

- Les clés actuelles sont temporaires et doivent être renouvelées avant la production
- Configurer des restrictions d'origine (referrers) dans la console Google Cloud
- Surveiller l'usage des APIs dans leurs dashboards respectifs
