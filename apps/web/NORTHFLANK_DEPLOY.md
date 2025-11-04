# Guide de déploiement sur Northflank

Ce guide vous explique comment déployer votre application React Router v7 + Hono sur Northflank.

## Prérequis

- Un compte Northflank (https://northflank.com)
- Un dépôt GitHub avec votre code
- Une instance Supabase configurée

## 1. Créer un nouveau service sur Northflank

1. Connectez-vous à Northflank
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Cliquez sur "Create Service" > "Combined Service"
4. Sélectionnez votre dépôt GitHub

## 2. Configuration du service

### Build Settings

- **Build Method**: Dockerfile
- **Dockerfile Path**: `apps/web/Dockerfile`
- **Context Path**: `apps/web`
- **Build Engine**: Buildpacks ou Docker

### Deployment Settings

- **Port**: 3000
- **Health Check Path**: `/` (ou créez un endpoint `/health`)
- **Resource Plan**: Choisissez selon vos besoins (Starter: 0.2 vCPU, 512MB RAM recommandé)

## 3. Variables d'environnement

Ajoutez ces variables d'environnement dans Northflank :

### Google Maps API
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_google_maps
```

### MasjidBox Prayer Times API
```
VITE_MASJIDBOX_API_KEY=votre_clé_masjidbox
```

### TMDB API (The Movie Database)
```
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase
```

### Configuration Node.js
```
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

## 4. Connexion à la base de données

Si vous utilisez une base de données Northflank (PostgreSQL) :

1. Créez une instance PostgreSQL dans Northflank
2. Ajoutez les variables d'environnement de connexion :
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Note**: Si vous utilisez Supabase, vous n'avez pas besoin de base de données séparée.

## 5. Domaine personnalisé (optionnel)

1. Allez dans "Networking" > "Domains"
2. Ajoutez votre domaine personnalisé
3. Configurez les enregistrements DNS selon les instructions de Northflank

## 6. Déploiement

1. Cliquez sur "Deploy" dans Northflank
2. Le build et le déploiement commenceront automatiquement
3. Surveillez les logs pour vérifier que tout fonctionne

## 7. CI/CD Automatique

Northflank détecte automatiquement les commits sur votre branche principale et redéploie :

- **Auto Deploy**: Activé par défaut
- **Branch**: master (ou main)
- **Build Trigger**: Automatic on push

## 8. Monitoring

Northflank fournit :
- **Logs en temps réel**: Consultez les logs de l'application
- **Metrics**: CPU, RAM, Network usage
- **Health Checks**: Vérification automatique de la santé de l'app

## Commandes utiles

### Tester le build localement
```bash
cd apps/web
docker build -t messhome .
docker run -p 3000:3000 --env-file .env messhome
```

### Vérifier les logs sur Northflank
Via l'interface web ou CLI Northflank

## Troubleshooting

### L'application ne démarre pas
- Vérifiez les logs dans Northflank
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que le PORT est correctement configuré (3000)

### Erreur de build
- Vérifiez que le Dockerfile est au bon endroit (`apps/web/Dockerfile`)
- Assurez-vous que le contexte de build est `apps/web`
- Vérifiez les dépendances dans package.json

### Erreur de connexion Supabase
- Vérifiez que l'URL Supabase est correcte
- Assurez-vous que les clés API sont valides
- Vérifiez que Supabase accepte les connexions depuis Northflank

## Coûts estimés

- **Starter Plan**: ~$10-20/mois (0.2-0.5 vCPU, 512MB-1GB RAM)
- **Professional Plan**: ~$40-80/mois (1-2 vCPU, 2-4GB RAM)

## Support

- Documentation Northflank: https://northflank.com/docs
- Support: support@northflank.com
- Discord: https://discord.gg/northflank
