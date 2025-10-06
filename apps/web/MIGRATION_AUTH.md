# Migration d'authentification - Instructions

## 📋 Étapes pour appliquer la migration 013

La migration d'authentification doit être appliquée manuellement dans le dashboard Supabase.

### 1. Accéder au dashboard Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet `jpxbrnnxldvripvjrbmy`
3. Aller dans **SQL Editor**

### 2. Exécuter les migrations

⚠️ **IMPORTANT**: Exécuter les migrations dans l'ordre suivant :

#### Étape 2.1: Migration principale
1. Copier le contenu du fichier `supabase/migrations/013_create_profiles_and_auth.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **Run**

#### Étape 2.2: Fix des colonnes profiles (si erreur à l'étape 2.1)
1. Copier le contenu du fichier `supabase/migrations/013_fix_profiles.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **Run**
4. Vérifier que toutes les colonnes apparaissent dans le résultat

#### Étape 2.3: 🔧 Ajouter user_id à family_settings
**CRITIQUE**: family_settings n'avait pas de user_id initialement !

1. Copier le contenu du fichier `supabase/migrations/015_add_user_id_to_family_settings.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **Run**
4. Vérifier que la colonne user_id existe et est remplie

#### Étape 2.4: ⚠️ **IMPORTANT** - Assigner TOUTES les données existantes à votre utilisateur
**ATTENTION**: Cette étape est OBLIGATOIRE sinon l'app affichera "Chargement..." en boucle !

1. Copier le contenu du fichier `supabase/migrations/014_assign_existing_data_to_user_FIXED.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **Run**
4. Vérifier dans le résultat que toutes vos données ont un user_id

**Pourquoi ?** Avec RLS activé, seules les données ayant un `user_id` correspondant à votre utilisateur sont visibles. Sans cette migration, toutes vos données existantes (repas, événements, notes, etc.) restent avec `user_id = NULL` donc invisibles.

#### Étape 2.5: 🔴 **CRITIQUE SÉCURITÉ** - Corriger les politiques RLS
**DANGER**: Sans cette étape, TOUS les utilisateurs voient les données de TOUS les autres !

1. Copier le contenu du fichier `supabase/migrations/016_fix_rls_policies_CRITICAL.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **Run**
4. Vérifier que toutes les politiques affichent "✅ Sécurisé"

**Pourquoi ?** Les anciennes politiques RLS utilisaient `USING (true)` ce qui donne accès à TOUTES les données à TOUS les utilisateurs. Cette migration remplace par `USING (auth.uid() = user_id)` pour isoler les données par utilisateur.

### 3. Vérifier l'installation

Exécuter ces requêtes pour vérifier que tout fonctionne :

```sql
-- Vérifier que la table profiles existe
SELECT * FROM profiles LIMIT 1;

-- Vérifier que les colonnes user_id ont été ajoutées
SELECT column_name, table_name
FROM information_schema.columns
WHERE column_name = 'user_id';

-- Vérifier les politiques RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('shopping_items', 'meals', 'events', 'tasks', 'notes');
```

### 4. Tester l'authentification

1. Ouvrir http://localhost:4000
2. Vous devriez voir le formulaire d'authentification
3. Créer un compte de test
4. Vérifier la redirection vers le dashboard

## ⚠️ Important

- **RLS activé** : Toutes les données sont maintenant isolées par utilisateur
- **Données existantes** : Les données sans `user_id` ne seront pas visibles (nécessite migration si données importantes)
- **OAuth Google** : Vérifier que l'URL de redirection est configurée dans Supabase :
  - Aller dans **Authentication → URL Configuration**
  - Ajouter `http://localhost:4000` dans **Site URL**
  - Ajouter `http://localhost:4000/**` dans **Redirect URLs**

## 🔑 Prochaines étapes

Après avoir appliqué la migration :

1. ✅ Tester l'inscription d'un nouvel utilisateur
2. ✅ Tester la connexion
3. ✅ Tester la déconnexion
4. ✅ Tester le reset password
5. ✅ Tester que les données sont bien isolées (créer 2 utilisateurs, vérifier que chacun voit ses propres données)
6. ✅ Configurer Google OAuth dans Supabase (optionnel)

Une fois l'authentification fonctionnelle, nous pourrons passer à la migration des données hardcodées vers des paramètres utilisateur.
