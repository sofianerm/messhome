# Audit des hooks - Ajout du user_id authentifié

## Date de l'audit
2025-10-07

## Objectif
S'assurer que chaque insertion (`.insert()`) dans les hooks de `apps/web/src/hooks/` inclut le `user_id` de l'utilisateur connecté via `supabase.auth.getUser()`.

## Résultats

### Hooks déjà corrects (2)

#### useFamilyMembers.ts
- **Statut**: Déjà correct
- **Ligne**: 54
- **Vérification**: Utilise `supabase.auth.getUser()` et ajoute `user_id: user.id`
- **Code**:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const newMember: FamilyMemberInsert = {
    ...memberData,
    user_id: user.id,
    // ...
  };
  ```

#### useFamilySettings.ts
- **Statut**: Déjà correct
- **Ligne**: 46
- **Vérification**: Utilise `supabase.auth.getUser()` et ajoute `user_id: user.id`
- **Code**:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const { data, error } = await supabase
    .from('family_settings')
    .insert({ ...updates, user_id: user.id })
  ```

### Hooks corrigés (9)

#### useEvents.ts
- **Statut**: Corrigé
- **Ligne**: 44
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion
- **Changement**:
  ```typescript
  // AVANT
  const newEvent: EventInsert = {
    ...eventData,
    user_id: null as any, // Temporaire : RLS désactivé pour le dev
  };

  // APRÈS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const newEvent: EventInsert = {
    ...eventData,
    user_id: user.id,
  };
  ```

#### useFavoriteMeals.ts
- **Statut**: Corrigé
- **Ligne**: 41
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion
- **Changement**:
  ```typescript
  // AVANT
  const { data, error } = await supabase
    .from('favorite_meals')
    .insert({
      name,
      category: category || null,
      user_id: null as any,
    })

  // APRÈS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const { data, error } = await supabase
    .from('favorite_meals')
    .insert({
      name,
      category: category || null,
      user_id: user.id,
    })
  ```

#### useFilms.ts
- **Statut**: Corrigé
- **Ligne**: 44
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

#### useMeals.ts
- **Statut**: Corrigé
- **Ligne**: 44
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

#### useNotes.ts
- **Statut**: Corrigé
- **Ligne**: 47
- **Problème**: Utilisait `user_id: null as any` avec un commentaire TODO
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion
- **Note**: Commentaire TODO supprimé

#### usePackingItems.ts
- **Statut**: Corrigé
- **Ligne**: 88
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

#### useShoppingItems.ts
- **Statut**: Corrigé
- **Ligne**: 46
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

#### useTasks.ts
- **Statut**: Corrigé
- **Ligne**: 44
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

#### useTrips.ts
- **Statut**: Corrigé
- **Ligne**: 70
- **Problème**: Utilisait `user_id: null as any`
- **Correction**: Ajout de l'authentification utilisateur avant l'insertion

## Résumé des changements

### Statistiques
- **Total de hooks audités**: 11
- **Hooks déjà corrects**: 2 (18%)
- **Hooks corrigés**: 9 (82%)

### Pattern de correction appliqué
Pour chaque hook corrigé, le pattern suivant a été appliqué:

```typescript
// 1. Récupérer l'utilisateur connecté
const { data: { user } } = await supabase.auth.getUser();

// 2. Vérifier l'authentification
if (!user) throw new Error('User not authenticated');

// 3. Utiliser user.id au lieu de null
user_id: user.id
```

### Impact
- **Sécurité**: Tous les inserts sont maintenant liés à l'utilisateur authentifié
- **RLS (Row Level Security)**: Préparation pour l'activation des politiques RLS sur Supabase
- **Traçabilité**: Chaque enregistrement sera correctement attribué à son créateur
- **Multi-tenancy**: Support complet pour plusieurs utilisateurs/familles

## Prochaines étapes recommandées

1. **Activer RLS sur Supabase**: Maintenant que tous les hooks utilisent `user_id`, il est possible d'activer les politiques RLS
2. **Tests d'intégration**: Tester chaque hook avec un utilisateur authentifié
3. **Gestion d'erreur**: S'assurer que les erreurs "User not authenticated" sont correctement gérées dans l'UI
4. **Documentation**: Mettre à jour la documentation pour refléter les changements d'authentification

## Fichiers modifiés

- `apps/web/src/hooks/useEvents.ts`
- `apps/web/src/hooks/useFavoriteMeals.ts`
- `apps/web/src/hooks/useFilms.ts`
- `apps/web/src/hooks/useMeals.ts`
- `apps/web/src/hooks/useNotes.ts`
- `apps/web/src/hooks/usePackingItems.ts`
- `apps/web/src/hooks/useShoppingItems.ts`
- `apps/web/src/hooks/useTasks.ts`
- `apps/web/src/hooks/useTrips.ts`

## Fichiers non modifiés (déjà corrects)

- `apps/web/src/hooks/useFamilyMembers.ts`
- `apps/web/src/hooks/useFamilySettings.ts`
