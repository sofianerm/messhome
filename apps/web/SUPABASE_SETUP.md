# 🗄️ Setup Supabase - Dashboard Familial

## ⚡ Instructions d'installation

### Étape 1 : Exécuter les migrations SQL

1. **Ouvre ton dashboard Supabase** :
   - URL : https://jpxbrnnxldvripvjrbmy.supabase.co
   - Ou va sur : https://supabase.com/dashboard/project/jpxbrnnxldvripvjrbmy

2. **Va dans le SQL Editor** :
   - Clique sur "SQL Editor" dans la sidebar gauche
   - Ou va directement : https://supabase.com/dashboard/project/jpxbrnnxldvripvjrbmy/sql

3. **Exécute le script de migration** :
   - Clique sur "New Query"
   - Copie TOUT le contenu du fichier `supabase/migrations/001_create_tables.sql`
   - Colle-le dans l'éditeur SQL
   - Clique sur "Run" (ou Ctrl+Enter)

4. **Vérifie la création des tables** :
   - Va dans "Table Editor" dans la sidebar
   - Tu devrais voir 6 tables :
     - ✅ `profiles`
     - ✅ `notes`
     - ✅ `events`
     - ✅ `shopping_items`
     - ✅ `meals`
     - ✅ `tasks`

---

## 📋 Structure des Tables

### 1. `profiles` - Profils utilisateurs
Stocke les informations des membres de la famille.

| Colonne     | Type   | Description                        |
|-------------|--------|------------------------------------|
| id          | UUID   | ID utilisateur (lié à auth.users)  |
| email       | TEXT   | Email de l'utilisateur             |
| full_name   | TEXT   | Nom complet                        |
| avatar_url  | TEXT   | URL de la photo de profil          |
| role        | TEXT   | Rôle : admin, parent, child        |
| created_at  | TIMESTAMP | Date de création                |
| updated_at  | TIMESTAMP | Date de dernière modification   |

### 2. `notes` - Notes rapides
Stocke les notes post-it de la vue générale.

| Colonne     | Type   | Description                        |
|-------------|--------|------------------------------------|
| id          | UUID   | ID unique de la note               |
| user_id     | UUID   | ID de l'utilisateur créateur       |
| text        | TEXT   | Contenu de la note                 |
| color       | TEXT   | Couleur : yellow, blue, green...   |
| created_at  | TIMESTAMP | Date de création                |
| updated_at  | TIMESTAMP | Date de modification            |

### 3. `events` - Événements agenda
Stocke les événements familiaux (RDV, anniversaires, etc.).

| Colonne     | Type   | Description                        |
|-------------|--------|------------------------------------|
| id          | UUID   | ID unique de l'événement           |
| user_id     | UUID   | ID du créateur                     |
| title       | TEXT   | Titre de l'événement               |
| date        | DATE   | Date de l'événement                |
| time        | TIME   | Heure (optionnel)                  |
| type        | TEXT   | Type : rdv, anniversaire, autre    |
| person      | TEXT   | Personne concernée                 |
| location    | TEXT   | Lieu de l'événement                |
| created_at  | TIMESTAMP | Date de création                |
| updated_at  | TIMESTAMP | Date de modification            |

### 4. `shopping_items` - Liste de courses
Stocke les articles de la liste de courses.

| Colonne     | Type    | Description                       |
|-------------|---------|-----------------------------------|
| id          | UUID    | ID unique de l'article            |
| user_id     | UUID    | ID du créateur                    |
| name        | TEXT    | Nom de l'article                  |
| checked     | BOOLEAN | Article coché ou non              |
| category    | TEXT    | Catégorie (fruits, légumes...)    |
| created_at  | TIMESTAMP | Date d'ajout                    |
| updated_at  | TIMESTAMP | Date de modification            |

### 5. `meals` - Repas/Menus
Stocke la planification des repas.

| Colonne     | Type   | Description                        |
|-------------|--------|------------------------------------|
| id          | UUID   | ID unique du repas                 |
| user_id     | UUID   | ID du créateur                     |
| date        | DATE   | Date du repas                      |
| meal_type   | TEXT   | Type : breakfast, lunch, dinner... |
| title       | TEXT   | Nom du repas                       |
| description | TEXT   | Description/recette                |
| created_at  | TIMESTAMP | Date de création                |
| updated_at  | TIMESTAMP | Date de modification            |

### 6. `tasks` - Tâches maison
Stocke les tâches ménagères et todo familiales.

| Colonne     | Type    | Description                       |
|-------------|---------|-----------------------------------|
| id          | UUID    | ID unique de la tâche             |
| user_id     | UUID    | ID du créateur                    |
| title       | TEXT    | Titre de la tâche                 |
| description | TEXT    | Description détaillée             |
| completed   | BOOLEAN | Tâche terminée ou non             |
| assigned_to | UUID    | Assignée à (ID utilisateur)       |
| due_date    | DATE    | Date limite                       |
| created_at  | TIMESTAMP | Date de création                |
| updated_at  | TIMESTAMP | Date de modification            |

---

## 🔒 Row Level Security (RLS)

Toutes les tables ont le RLS activé avec les politiques suivantes :

### Règles communes :
- ✅ **SELECT** : Tout le monde peut voir toutes les données (famille partagée)
- ✅ **INSERT** : Les utilisateurs créent leurs propres données
- ✅ **UPDATE** : Les utilisateurs modifient leurs propres données
  - Exception : `shopping_items` et `tasks` peuvent être modifiés par tous (collaboration)
- ✅ **DELETE** : Les utilisateurs suppriment uniquement leurs propres données

### Pourquoi ce choix ?
Dans un contexte familial, tout le monde doit pouvoir :
- Voir tous les événements, notes, courses, repas
- Cocher des articles de courses
- Compléter les tâches (même si créées par quelqu'un d'autre)

---

## 🔄 Fonctionnalités automatiques

### 1. Auto-update `updated_at`
Un trigger met automatiquement à jour la colonne `updated_at` à chaque modification.

### 2. Auto-create profile
Quand un utilisateur s'inscrit via Auth, un profil est automatiquement créé dans la table `profiles`.

---

## 🧪 Test de la connexion

Une fois les migrations exécutées, tu peux tester la connexion avec ce code :

```typescript
import { supabase } from '@/lib/supabase';

// Test simple
const { data, error } = await supabase.from('notes').select('*');
console.log('Notes:', data, error);
```

---

## 🚀 Prochaines étapes

1. ✅ Exécuter les migrations SQL (ce document)
2. ⏳ Tester la connexion Supabase
3. ⏳ Migrer le composant Notes vers Supabase
4. ⏳ Migrer le composant AgendaFamilial
5. ⏳ Ajouter l'authentification avec Auth.js

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard du projet](https://supabase.com/dashboard/project/jpxbrnnxldvripvjrbmy)
- [SQL Editor](https://supabase.com/dashboard/project/jpxbrnnxldvripvjrbmy/sql)
- [Table Editor](https://supabase.com/dashboard/project/jpxbrnnxldvripvjrbmy/editor)
