# Changelog - Dashboard Familial

## 🎯 Phase B : Setup Supabase (Complété)

### ✅ Ce qui a été fait :

#### 1. **Installation & Configuration**
- ✅ Installé `@supabase/supabase-js`
- ✅ Créé le client Supabase dans `src/lib/supabase.ts`
- ✅ Créé les types TypeScript dans `src/lib/database.types.ts`
- ✅ Ajouté les credentials Supabase dans `.env`

#### 2. **Migrations Database**
- ✅ Créé le script SQL `supabase/migrations/001_create_tables.sql`
- ✅ 6 tables créées :
  - `profiles` - Profils utilisateurs
  - `notes` - Notes rapides
  - `events` - Événements agenda
  - `shopping_items` - Liste de courses
  - `meals` - Repas/menus
  - `tasks` - Tâches maison
- ✅ Row Level Security (RLS) configuré
- ✅ Triggers auto-update `updated_at`
- ✅ Trigger auto-create profile

#### 3. **Migration Notes → Supabase**
- ✅ Créé le hook `useNotes()` dans `src/hooks/useNotes.ts`
  - Chargement des notes
  - Ajout/modification/suppression
  - Real-time subscriptions
- ✅ Créé le composant `NotesSection.tsx`
  - UI complète avec Supabase
  - États loading/error
  - Badge "LIVE Supabase"
- ✅ Intégré dans `VueGenerale.jsx`
  - Remplacé la version locale par Supabase
  - Nettoyé le code (supprimé fonctions inutiles)

#### 4. **Documentation**
- ✅ `SUPABASE_SETUP.md` - Guide complet d'installation
- ✅ `CHANGELOG.md` - Ce fichier

---

## 📊 État Actuel

### Composants migrés vers Supabase :
- ✅ **Notes rapides** (VueGenerale)

### Composants encore en local :
- ⏳ **Agenda familial** (events)
- ⏳ **Liste de courses** (shopping_items)
- ⏳ **Repas & menus** (meals)
- ⏳ **Tâches maison** (tasks)

---

## 🧪 Test de l'application

### Prérequis :
1. ✅ Migrations SQL exécutées dans Supabase
2. ✅ `.env` configuré avec les credentials

### Démarrer l'app :
```bash
cd apps/web
npm run dev
```

### Tester les Notes :
1. Aller sur la page principale
2. Scroller vers "Notes rapides"
3. Tu devrais voir le badge "🔥 LIVE Supabase"
4. Ajouter une note → elle est sauvegardée dans Supabase
5. Modifier/supprimer → les changements sont persistés
6. Ouvrir un autre onglet → les notes se synchronisent en temps réel !

---

## 🔐 Sécurité

### Avant (Phase A) :
- ❌ Clés API hardcodées dans le code
- ❌ Google Maps exposée au client

### Après (Phases A + B) :
- ✅ Toutes les clés dans `.env`
- ✅ Google Maps via proxy serveur
- ✅ Supabase avec RLS activé
- ✅ Variables sensibles non commitées (`.gitignore`)

---

## 🚀 Prochaines Étapes

### Phase C : Migration complète vers Supabase
1. ⏳ Migrer AgendaFamilial
2. ⏳ Migrer ListeCourses
3. ⏳ Migrer RepasMenus
4. ⏳ Migrer TachesMaison

### Phase D : Authentification
1. ⏳ Setup Auth.js avec Supabase
2. ⏳ Login/Signup UI
3. ⏳ Gestion des profils
4. ⏳ Multi-utilisateurs (famille)

### Phase E : Optimisations
1. ⏳ Migration TypeScript complète
2. ⏳ Tanstack Query pour le cache
3. ⏳ Extraction hooks API (useWeather, usePrayer, useTransport)
4. ⏳ React.memo & optimisations perfs

---

## 📝 Notes Techniques

### Real-time Subscriptions
Les notes utilisent les subscriptions Supabase en temps réel :
```typescript
supabase.channel('notes-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, ...)
```

Cela signifie que tous les changements dans la base de données sont instantanément reflétés dans l'UI !

### User ID Temporaire
Pour l'instant, on utilise un UUID temporaire :
```typescript
const tempUserId = '00000000-0000-0000-0000-000000000000';
```

Cela sera remplacé par l'ID de l'utilisateur authentifié après l'ajout de Auth.js.

### Row Level Security (RLS)
Les politiques actuelles permettent :
- ✅ Tout le monde peut voir toutes les notes (famille partagée)
- ✅ Seul le créateur peut modifier/supprimer ses notes
- ✅ Tout le monde peut créer des notes

Ces règles seront affinées avec l'authentification.

---

## 🐛 Dépannage

### Erreur "Missing Supabase environment variables"
→ Vérifie que `.env` contient bien :
```env
NEXT_PUBLIC_SUPABASE_URL=https://jpxbrnnxldvripvjrbmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Erreur "relation does not exist"
→ Les migrations SQL n'ont pas été exécutées. Va dans le SQL Editor de Supabase et exécute `001_create_tables.sql`

### Les notes ne se chargent pas
→ Vérifie dans le Table Editor de Supabase que la table `notes` existe bien

### Real-time ne fonctionne pas
→ Vérifie que les subscriptions sont activées dans Settings > API > Realtime

---

## 📚 Fichiers Modifiés

### Créés :
- `src/lib/supabase.ts`
- `src/lib/database.types.ts`
- `src/hooks/useNotes.ts`
- `src/components/NotesSection.tsx`
- `supabase/migrations/001_create_tables.sql`
- `SUPABASE_SETUP.md`
- `CHANGELOG.md`

### Modifiés :
- `.env` (ajout credentials Supabase)
- `.env.example` (template)
- `src/components/sections/VueGenerale.jsx` (intégration NotesSection)
- `package.json` (ajout @supabase/supabase-js)

---

## ✨ Résultat

**Tu as maintenant un dashboard familial avec :**
- 🔐 Clés API sécurisées
- 🗄️ Base de données Supabase opérationnelle
- 🔥 Notes en temps réel
- 📊 Infrastructure prête pour le reste des features

**Prêt à migrer le prochain composant ! 🚀**
