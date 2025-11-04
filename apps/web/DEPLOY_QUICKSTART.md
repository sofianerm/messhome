# 🚀 Quick Start - Déploiement Northflank

Guide rapide pour déployer en 5 minutes !

## Étape 1 : Installation de la CLI

```bash
npm install -g @northflank/cli
```

## Étape 2 : Connexion

```bash
northflank login
```

Une page web s'ouvrira pour vous authentifier.

## Étape 3 : Récupérer votre PROJECT_ID

```bash
northflank project list
```

Copiez l'ID du projet que vous souhaitez utiliser (ou créez-en un nouveau sur https://northflank.com).

## Étape 4 : Ajouter le PROJECT_ID à votre .env

```bash
# Dans apps/web/.env
NORTHFLANK_PROJECT_ID=votre_project_id_ici
```

## Étape 5 : Déployer !

```bash
cd apps/web
npm run deploy:northflank
```

Le script va :
- ✅ Créer le service sur Northflank
- ✅ Uploader vos variables d'environnement
- ✅ Lancer le build et le déploiement
- ✅ Afficher l'URL de votre application

## Commandes utiles

### Voir les logs en temps réel
```bash
npm run logs:northflank
```

### Redémarrer le service
```bash
northflank service restart --project $NORTHFLANK_PROJECT_ID --service messhome-web
```

### Voir le status
```bash
northflank service get --project $NORTHFLANK_PROJECT_ID --service messhome-web
```

## Variables d'environnement requises

Assurez-vous que votre fichier `.env` contient :

```env
# Northflank
NORTHFLANK_PROJECT_ID=votre_project_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_google_maps

# MasjidBox (optionnel)
VITE_MASJIDBOX_API_KEY=votre_clé_masjidbox

# TMDB (optionnel)
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
```

## En cas de problème

### "Northflank CLI not found"
```bash
npm install -g @northflank/cli
```

### "Not authenticated"
```bash
northflank login
```

### "Project not found"
Vérifiez votre PROJECT_ID avec :
```bash
northflank project list
```

### Le service ne démarre pas
Vérifiez les logs :
```bash
npm run logs:northflank
```

## Prochaines étapes

1. **Domaine personnalisé** : Configurez sur https://northflank.com
2. **CI/CD** : Le redéploiement est automatique à chaque push sur `master`
3. **Scaling** : Ajustez les ressources selon vos besoins

## Documentation complète

- Guide CLI complet : `NORTHFLANK_CLI.md`
- Guide web UI : `NORTHFLANK_DEPLOY.md`
- Scripts disponibles : `scripts/deploy-northflank.js`

## Support

- Discord Northflank : https://discord.gg/northflank
- Documentation : https://northflank.com/docs
- Email : support@northflank.com
