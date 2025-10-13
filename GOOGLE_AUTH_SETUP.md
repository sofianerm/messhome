# Configuration Google OAuth - Dashboard Family

Ce document explique comment configurer l'authentification Google pour le Dashboard Family.

## 1. Configuration dans Supabase Dashboard

### Étape 1 : Configurer les URLs de redirection

1. Aller dans **Supabase Dashboard** > Votre projet
2. Aller dans **Authentication** > **URL Configuration**
3. Ajouter les URLs suivantes dans **Redirect URLs** :

```
http://localhost:4000/auth/callback
http://localhost:4001/auth/callback
https://votre-domaine.com/auth/callback
```

### Étape 2 : Activer Google Provider

1. Aller dans **Authentication** > **Providers**
2. Trouver **Google** dans la liste
3. Activer le toggle
4. Configurer les identifiants OAuth :
   - **Client ID** : Votre Google Client ID
   - **Client Secret** : Votre Google Client Secret

## 2. Obtenir les identifiants Google OAuth

### Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet (ou sélectionner un projet existant)
3. Activer l'API **Google+ API**

### Créer des identifiants OAuth 2.0

1. Aller dans **APIs & Services** > **Credentials**
2. Cliquer sur **Create Credentials** > **OAuth client ID**
3. Choisir **Web application**
4. Configurer :
   - **Name** : Dashboard Family
   - **Authorized JavaScript origins** :
     ```
     http://localhost:4000
     http://localhost:4001
     https://votre-domaine.com
     ```
   - **Authorized redirect URIs** :
     ```
     https://jpxbrnnxldvripvjrbmy.supabase.co/auth/v1/callback
     ```
     ⚠️ **Important** : Cette URL doit être celle de votre projet Supabase
     Format : `https://[PROJECT_REF].supabase.co/auth/v1/callback`

5. Cliquer sur **Create**
6. Copier le **Client ID** et **Client Secret**
7. Les coller dans Supabase Dashboard (voir Étape 2 ci-dessus)

## 3. Écran de consentement OAuth

1. Dans Google Cloud Console, aller dans **APIs & Services** > **OAuth consent screen**
2. Configurer :
   - **App name** : Dashboard Family
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
3. Ajouter les scopes nécessaires (par défaut, email et profile suffisent)
4. Ajouter des utilisateurs de test si l'app est en mode "Testing"

## 4. Architecture du flow OAuth

```
1. User clique sur "Continuer avec Google" dans AuthForm
   ↓
2. useAuth.signInWithGoogle() est appelé
   ↓
3. Supabase redirige vers Google avec le Client ID
   ↓
4. User s'authentifie sur Google et accepte
   ↓
5. Google redirige vers Supabase (/auth/v1/callback)
   ↓
6. Supabase traite les tokens et redirige vers l'app
   ↓
7. L'app reçoit les tokens dans l'URL (#access_token=...)
   ↓
8. /auth/callback/page.jsx intercepte et établit la session
   ↓
9. Redirection vers / (Dashboard)
```

## 5. Fichiers impliqués dans le projet

- **`src/hooks/useAuth.ts`** (ligne 149-168) : Fonction `signInWithGoogle()`
- **`src/components/auth/AuthForm.tsx`** (ligne 50-55) : Bouton Google Sign In
- **`src/app/auth/callback/page.jsx`** : Page de callback qui gère les tokens

## 6. Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifier que l'URL dans Google Cloud Console correspond exactement à celle de Supabase
- Format : `https://[PROJECT_REF].supabase.co/auth/v1/callback`

### Erreur "Pas de token d'accès reçu"
- Vérifier que les Redirect URLs sont bien configurées dans Supabase
- Vérifier que le Client ID et Secret sont corrects

### La page reste en "Finalisation de la connexion..."
- Vérifier la console du navigateur pour les erreurs
- Vérifier que la session est bien créée dans Supabase

### L'onboarding s'affiche pour un user existant
- Vérifier que `family_settings.onboarding_completed` est à `true`
- Vérifier que `family_settings.user_id` correspond bien à l'ID de l'user

## 7. Test en local

1. Démarrer le serveur de dev :
   ```bash
   cd apps/web
   npm run dev
   ```

2. Ouvrir http://localhost:4000 (ou 4001 si 4000 est pris)

3. Cliquer sur "Continuer avec Google"

4. Vérifier que la redirection fonctionne et que vous êtes bien connecté

## 8. Variables d'environnement

Le projet utilise les variables suivantes (dans `.env`) :

```env
VITE_SUPABASE_URL=https://jpxbrnnxldvripvjrbmy.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

Pas besoin de configurer les identifiants Google dans `.env`, ils sont gérés par Supabase.

---

**Dernière mise à jour** : 13 octobre 2025
**Statut** : ✅ Route callback créée et configurée
