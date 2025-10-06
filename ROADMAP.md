# 🚀 ROADMAP Dashboard Familial

## 📊 ÉTAT ACTUEL (Janvier 2025)

### ✅ Complété - Phase 1 & 2 (Partiellement)

**Fonctionnalités implémentées** :
- ✅ Supabase PostgreSQL + Real-time subscriptions
- ✅ Hooks personnalisés (usePackingItems, useTasks, useEvents, useFilms, etc.)
- ✅ Design harmonisé sur toutes les pages (cartes blanches, typographie cohérente)
- ✅ Voyages avec packing lists (drag & drop catégories, countdown timer)
- ✅ Agenda Familial (time picker tactile, catégories d'événements)
- ✅ Repas & Menus (planification 2 semaines, favoris)
- ✅ Tâches Maison (suppression groupée, dates limites)
- ✅ Listes de Courses (suppression groupée)
- ✅ Filmographie (films + séries TV via TMDB)
- ✅ Météo (intégration API)
- ✅ Transport (CFF trains + Google Maps)
- ✅ Santé & Documents

**Architecture** :
- ✅ React Router v7 + Hono server
- ✅ Tailwind CSS + design system cohérent
- ✅ Zustand + Tanstack Query pour state management
- ✅ Real-time avec Supabase

---

## 🎯 PHASES À VENIR

### Phase 1 : Fondations (RESTANT)

**Priority: HAUTE**
- ❌ Migration TypeScript (.jsx → .tsx)
  - Typer les props des composants
  - Typer les réponses API
  - Typer les états Zustand
- ❌ Sécurisation clés API *(SKIP - usage local uniquement)*

### Phase 2 : Backend (RESTANT)

**Priority: MOYENNE**
- ❌ Auth.js integration
  - Login Google/Email
  - Sessions utilisateur
- ❌ Multi-utilisateurs
  - Profils (Papa, Maman, Enfants)
  - Permissions par utilisateur
  - Données personnalisées par membre
- ⚠️ Corriger erreurs actuelles :
  - DocumentsUtiles.jsx manquant
  - distance-matrix/route.ts cassé

### Phase 3 : Features Avancées

**Priority: MOYENNE**
- ❌ Notifications
  - Push notifications (Expo pour mobile)
  - Service Worker pour web
  - Rappels RDV/tâches/événements
- ❌ Sync multi-device
  - WebSocket real-time
  - Offline-first avec sync
- ❌ Mode offline
  - Service Worker PWA
  - Cache API
  - Données en cache
- ❌ Tests unitaires
  - Vitest + Testing Library
  - Coverage minimum 70%
  - Tests des hooks critiques

### Phase 4 : Production & Optimisation

**Priority: BASSE**
- ❌ Performance
  - React.memo() sur composants lourds
  - Lazy loading des sections
  - Code splitting
  - Optimisation images (WebP)
- ❌ CI/CD
  - GitHub Actions
  - Tests automatiques
  - Déploiement auto
- ❌ Monitoring
  - Sentry pour erreurs
  - Analytics (Plausible/GA)
  - Performance monitoring
- ❌ Documentation
  - README complet avec screenshots
  - JSDoc pour fonctions
  - Storybook pour composants

### Phase 5 : Mobile App (Expo)

**Priority: BASSE**
- ❌ Navigation améliorée
  - Bottom tabs avec icônes
  - Stack navigation
  - Deep linking
- ❌ Sync Web/Mobile
  - Backend partagé
  - Real-time sync
  - Offline-first

---

## ⚡ QUICK WINS (Impact immédiat)

*Tâches rapides à haute valeur ajoutée*

1. ✅ ~~Ajouter localStorage pour notes~~ (fait avec Supabase)
2. ✅ ~~Extraire hooks~~ (fait)
3. ✅ ~~Améliorer états de chargement~~ (fait)
4. ❌ Ajouter React.memo sur widgets lourds (1h)
5. ❌ Lazy loading des sections (2h)
6. ❌ Corriger DocumentsUtiles.jsx (30min)
7. ❌ Réparer distance-matrix route (30min)

---

## 📝 NOTES

- **Usage local uniquement** → Pas besoin de sécurisation avancée des clés API
- **Focus sur UX/UI** → Design harmonisé est une priorité
- **Tactile-first** → Optimisation pour tablettes
- **Real-time** → Toutes les fonctionnalités doivent être instantanées (Supabase)

---

*Dernière mise à jour : 6 octobre 2025*
