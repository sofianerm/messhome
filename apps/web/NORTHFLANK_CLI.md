# Déploiement sur Northflank via CLI

Guide complet pour déployer votre application sur Northflank en utilisant la CLI.

## Installation de Northflank CLI

### Windows (via npm)
```bash
npm install -g @northflank/cli
```

### macOS / Linux
```bash
npm install -g @northflank/cli
# ou avec Homebrew (macOS)
brew install northflank/tap/northflank
```

## Configuration initiale

### 1. Login
```bash
northflank login
```
Cela ouvrira votre navigateur pour vous authentifier.

### 2. Lister vos projets
```bash
northflank project list
```

### 3. Créer un nouveau projet (si nécessaire)
```bash
northflank project create \
  --name "MeshHome Dashboard" \
  --description "Family Dashboard Application"
```

## Déploiement de l'application

### Option 1 : Déploiement depuis le repo GitHub

```bash
# Créer un service depuis GitHub
northflank service create \
  --project <PROJECT_ID> \
  --name messhome-web \
  --deployment-source github \
  --repo-url https://github.com/sofianerm/messhome.git \
  --branch master \
  --dockerfile-path apps/web/Dockerfile \
  --context-path apps/web \
  --port 3000 \
  --resource-cpu 0.2 \
  --resource-memory 512
```

### Option 2 : Déploiement depuis une image Docker locale

```bash
# 1. Build l'image Docker localement
cd apps/web
docker build -t messhome:latest .

# 2. Tag l'image pour Northflank Registry
docker tag messhome:latest registry.northflank.com/<PROJECT_ID>/messhome:latest

# 3. Login au registry Northflank
docker login registry.northflank.com

# 4. Push l'image
docker push registry.northflank.com/<PROJECT_ID>/messhome:latest

# 5. Créer le service depuis l'image
northflank service create \
  --project <PROJECT_ID> \
  --name messhome-web \
  --deployment-source image \
  --image registry.northflank.com/<PROJECT_ID>/messhome:latest \
  --port 3000
```

## Configuration des variables d'environnement

### Ajouter des variables une par une
```bash
northflank secret create \
  --project <PROJECT_ID> \
  --name NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
  --value "votre_clé_api"

northflank secret create \
  --project <PROJECT_ID> \
  --name NEXT_PUBLIC_SUPABASE_URL \
  --value "https://votre-projet.supabase.co"

northflank secret create \
  --project <PROJECT_ID> \
  --name NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --value "votre_clé_anon"

northflank secret create \
  --project <PROJECT_ID> \
  --name SUPABASE_SERVICE_ROLE_KEY \
  --value "votre_clé_service_role"

northflank secret create \
  --project <PROJECT_ID> \
  --name VITE_MASJIDBOX_API_KEY \
  --value "votre_clé_masjidbox"

northflank secret create \
  --project <PROJECT_ID> \
  --name NEXT_PUBLIC_TMDB_API_KEY \
  --value "votre_clé_tmdb"
```

### Ajouter des variables depuis un fichier .env
```bash
# Utiliser le script fourni
npm run deploy:env
```

## Lier les variables au service

```bash
northflank service env-link \
  --project <PROJECT_ID> \
  --service messhome-web \
  --secret NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
  --secret NEXT_PUBLIC_SUPABASE_URL \
  --secret NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --secret SUPABASE_SERVICE_ROLE_KEY \
  --secret VITE_MASJIDBOX_API_KEY \
  --secret NEXT_PUBLIC_TMDB_API_KEY
```

## Commandes de gestion

### Voir les logs en temps réel
```bash
northflank service logs \
  --project <PROJECT_ID> \
  --service messhome-web \
  --follow
```

### Redémarrer le service
```bash
northflank service restart \
  --project <PROJECT_ID> \
  --service messhome-web
```

### Mettre à jour le service
```bash
northflank service update \
  --project <PROJECT_ID> \
  --service messhome-web \
  --resource-cpu 0.5 \
  --resource-memory 1024
```

### Supprimer le service
```bash
northflank service delete \
  --project <PROJECT_ID> \
  --service messhome-web
```

## Configuration d'un domaine personnalisé

```bash
# Ajouter un domaine
northflank domain create \
  --project <PROJECT_ID> \
  --service messhome-web \
  --domain votre-domaine.com

# Lister les domaines
northflank domain list \
  --project <PROJECT_ID> \
  --service messhome-web
```

## Monitoring et métriques

### Voir l'état du service
```bash
northflank service get \
  --project <PROJECT_ID> \
  --service messhome-web
```

### Voir les métriques
```bash
northflank service metrics \
  --project <PROJECT_ID> \
  --service messhome-web
```

## Scripts npm disponibles

Ajoutez ces scripts à votre `package.json` :

```json
{
  "scripts": {
    "deploy:northflank": "node scripts/deploy-northflank.js",
    "deploy:env": "node scripts/upload-env.js",
    "logs:northflank": "northflank service logs --project $PROJECT_ID --service messhome-web --follow"
  }
}
```

## Troubleshooting

### Obtenir le PROJECT_ID
```bash
northflank project list
```

### Vérifier la connexion
```bash
northflank whoami
```

### Rafraîchir le token
```bash
northflank login --refresh
```

### Debug d'un déploiement échoué
```bash
# Voir les logs de build
northflank build logs \
  --project <PROJECT_ID> \
  --build-id <BUILD_ID>

# Voir les événements du service
northflank service events \
  --project <PROJECT_ID> \
  --service messhome-web
```

## CI/CD avec GitHub Actions

Pour automatiser le déploiement, vous pouvez utiliser GitHub Actions. Voir le fichier `.github/workflows/deploy-northflank.yml`.

## Ressources

- Documentation CLI : https://northflank.com/docs/v1/cli/overview
- API Reference : https://northflank.com/docs/v1/api/overview
- Support : support@northflank.com
