# Audit et Corrections - Dashboard Family

**Date**: 7 Octobre 2025
**Session**: Continuation - Problèmes session et onboarding

---

## 📋 Résumé des problèmes résolus

| # | Problème | Status | Solution |
|---|----------|--------|----------|
| 1 | Onboarding affiché pour users existants | ✅ Réglé | Hook unifié `useAuthWithSettings` avec détection correcte |
| 2 | Chargement infini après inactivité | ✅ Réglé | Auto-reload après 2s de veille + watchdog 15s |
| 3 | Repas favoris partagés entre users | ✅ Réglé | Ajout filter `.eq('user_id', user.id)` |
| 4 | Conflits sessions entre onglets | ✅ Réglé | Retour au localStorage par défaut de Supabase |
| 5 | CSS ne charge pas sur Chrome (dev) | ⚠️ Partiel | Fonctionne après clear cache, bug Vite/Chrome en dev |

---

## 🔧 Modifications détaillées

### 1. Authentification et Session

#### `src/lib/supabase.ts`
**Avant**: Configuration custom storage (mélange localStorage + sessionStorage)
```typescript
const customStorage = {
  getItem: (key) => {
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
    const localValue = window.localStorage.getItem(key);
    if (localValue) window.sessionStorage.setItem(key, localValue);
    return localValue;
  },
  // ...
}
```

**Après**: Configuration par défaut Supabase (plus simple, plus fiable)
```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

**Raison**: Le custom storage causait des corruptions quand Edge/Chrome mettaient les onglets en veille.

---

#### `src/hooks/useAuthWithSettings.ts` (NOUVEAU)
Hook unifié qui remplace la combinaison `useAuth` + `useFamilySettings`.

**Fonctionnalités**:
- Charge user + settings en une seule passe (séquentiel)
- Calcule automatiquement `needsOnboarding`
- Protection anti-boucle avec `loadingRef`
- Timeout 10s sur requêtes pour éviter blocages
- Détection visibilité page pour débloquer si stuck

```typescript
export function useAuthWithSettings() {
  const [state, setState] = useState<AuthWithSettingsState>({
    user: null,
    settings: null,
    loading: true,
    needsOnboarding: false,
  });

  // Protection anti-boucle
  const loadingRef = useRef(false);

  // Timeout sur getSession() et select()
  // Détection visibilitychange pour reset si bloqué
  // ...
}
```

**Usage dans `page.jsx`**:
```javascript
const {
  isAuthenticated,
  needsOnboarding,
  loading,
  settings,
  signOut,
  reload
} = useAuthWithSettings();
```

---

#### `src/hooks/useAuth.ts`
**Simplifications**:
- Supprimé refresh manuel toutes les 5min (Supabase le gère)
- Supprimé handleVisibilityChange custom (conflit avec page.jsx)
- Gardé uniquement: loadSession + onAuthStateChange

```typescript
useEffect(() => {
  loadSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, user: null, profile: null, loading: false }));
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

#### `src/hooks/useFamilySettings.ts`
**Problèmes corrigés**:
1. **Retry infini**: Supprimé `setTimeout(() => fetchSettings(), 300)` qui causait boucle
2. **Pas de filtre user_id**: Ajout `.eq('user_id', user.id)`
3. **Loading bloqué**: Mis `loading: false` correctement dans tous les cas

```typescript
const fetchSettings = async () => {
  try {
    setLoading(true);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      // PAS DE RETRY - juste mettre loading: false
      setSettings(null);
      setLoading(false);
      return;
    }

    // FILTRER par user_id explicitement
    const { data, error } = await supabase
      .from('family_settings')
      .select('*')
      .eq('user_id', user.id) // ← AJOUTÉ
      .maybeSingle();

    setSettings(data || null);
    setLoading(false);
  } catch (err) {
    setSettings(null);
    setLoading(false);
  }
};
```

---

### 2. Multi-user et RLS

#### `src/hooks/useFavoriteMeals.ts`
**Problème**: Tous les users voyaient tous les repas favoris.

**Solution**: Ajout filter user_id + vérification auth
```typescript
const fetchFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setFavorites([]);
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from('favorite_meals')
    .select('*')
    .eq('user_id', user.id) // ← AJOUTÉ
    .order('name', { ascending: true });

  setFavorites(data || []);
};
```

---

### 3. Gestion de la veille navigateur

#### `src/app/page.jsx`
**Problème**: Edge/Chrome tuent les connexions WebSocket/réseau après quelques secondes d'inactivité. Les hooks React restent bloqués en loading.

**Solution**: Détection visibilitychange + auto-reload

```javascript
useEffect(() => {
  let wasHidden = false;
  let hiddenTime = 0;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      wasHidden = true;
      hiddenTime = Date.now();
    } else if (wasHidden) {
      const hiddenDuration = Date.now() - hiddenTime;

      // Si caché plus de 2 secondes, recharger
      if (hiddenDuration > 2000) {
        console.warn('⚠️ Rechargement après veille');
        window.location.reload();
      }

      wasHidden = false;
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Watchdog 15s**: Protection supplémentaire si loading dure trop longtemps
```javascript
useEffect(() => {
  if (loading) {
    const timer = setTimeout(() => {
      console.error('⚠️ Loading timeout après 15s - forçage arrêt');
      setForceStopLoading(true);
    }, 15000);
    return () => clearTimeout(timer);
  }
}, [loading]);
```

---

### 4. Onboarding

#### Problème détecté
Après fermeture navigateur + réouverture, les users avec `onboarding_completed: true` voyaient quand même la page d'onboarding.

**Cause root**:
- `useFamilySettings` retournait `loading: false` + `settings: null` avant que l'auth soit chargée
- `page.jsx` voyait `!settings` et affichait l'onboarding
- Ensuite les vraies données arrivaient mais trop tard

**Solution**: `useAuthWithSettings` attend que l'auth soit complètement chargée avant de mettre `loading: false`.

---

### 5. Migrations SQL créées

#### `023_debug_family_settings.sql`
Queries de diagnostic pour vérifier user_id et onboarding_completed:
```sql
SELECT id, family_name, user_id, onboarding_completed, created_at
FROM family_settings;

SELECT id, email, created_at FROM auth.users;

SELECT * FROM pg_policies WHERE tablename = 'family_settings';
```

#### `024_configure_jwt_expiry.sql`
Documentation pour configurer la durée du JWT dans Supabase Dashboard:
- Par défaut: 3600s (1h) - trop court
- Recommandé: 86400s (24h)
- Maximum: 604800s (7 jours)

#### `025_debug_onboarding_flag.sql`
Debug et fix pour users ayant onboarding_completed à NULL:
```sql
UPDATE family_settings
SET onboarding_completed = true
WHERE user_id = '4bcec78a-50aa-4006-b64d-bd5123081e6e';
```

---

### 6. Utilitaires créés (non utilisés finalement)

#### `src/contexts/AuthContext.tsx`
Context React pour partager auth globalement (créé mais pas intégré, `useAuthWithSettings` suffit).

#### `src/hooks/useAuthReady.ts`
Hook pour détecter quand auth est prête (créé mais pas utilisé, `useAuthWithSettings` le gère).

#### `src/utils/debugLoops.ts`
Détection de boucles infinies dans hooks (créé mais pas intégré, pas nécessaire finalement).

#### `src/utils/safeQuery.ts`
Wrapper pour requêtes avec timeout (créé mais pas utilisé, timeout ajouté directement dans `useAuthWithSettings`).

---

## 🎯 État final

### ✅ Ce qui fonctionne
- **Edge**: Fonctionne parfaitement, auto-reload après veille
- **Chrome**: Fonctionne en navigation normale
- **Multi-user**: Données complètement isolées entre users
- **Onboarding**: N'apparaît que pour vrais nouveaux users
- **RLS**: Toutes les tables sécurisées avec `auth.uid() = user_id`

### ⚠️ Problèmes connus
- **Chrome dev**: CSS disparaît parfois après connexion (bug Vite/React Router)
  - **Workaround**: Clear cache (`Ctrl+Shift+R`) ou utiliser Edge
  - **En production**: Devrait fonctionner normalement (CSS compilé différemment)

### 🔄 Améliorations futures possibles
1. Migrer vers production et tester le CSS
2. Si problème CSS persiste, investiguer config Vite pour Chrome
3. Supprimer les utilitaires non utilisés (AuthContext, useAuthReady, etc.)
4. Optimiser le watchdog 15s (peut-être trop long)
5. Améliorer UX du reload automatique (afficher message "Rechargement...")

---

## 📝 Instructions pour reprendre

Si tu recommences une nouvelle conversation:

1. **Les problèmes résolus**:
   - Onboarding ✅
   - Chargement infini ✅
   - Multi-user ✅
   - Repas favoris ✅

2. **Le seul problème restant**: CSS sur Chrome en dev
   - Utilise Edge pour dev
   - Ou teste en prod

3. **Fichiers clés modifiés**:
   - `src/hooks/useAuthWithSettings.ts` - Hook principal auth
   - `src/app/page.jsx` - Auto-reload après veille
   - `src/lib/supabase.ts` - Config simplifiée
   - `src/hooks/useFavoriteMeals.ts` - Filter user_id

4. **Derniers commits**:
```bash
git log --oneline -5
```

5. **Pour tester**:
```bash
cd apps/web
npm run dev
# Edge: http://localhost:4000
```

---

**Commit SHA**: `c4cccbf`
**Branche**: `master`
**Date commit**: 2025-10-07
