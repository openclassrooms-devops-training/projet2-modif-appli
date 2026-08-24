# Étape 5 — Écrans CRUD étudiants et navigation

## Objectif

Consommer les APIs CRUD des étudiants côté frontend, protéger les routes par authentification, ajouter une navigation cohérente et des redirections logiques après inscription et connexion.

## Éléments ajoutés

### Sécurité et navigation

- `AuthService` : expose `isAuthenticated()` et `logout()` en s'appuyant sur le token stocké dans `localStorage`.
- `authGuard` (`CanActivateFn`) : protège la route `/students`, redirige vers `/login` si aucun token n'est présent.
- `authInterceptor` (`HttpInterceptorFn`) : ajoute automatiquement l'en-tête `Authorization: Bearer <token>` sur tous les appels vers `/api/**`.
- `AppComponent` : nouveau shell avec barre de menu (`Étudiants`, `Inscription`, `Déconnexion`), lien `Swagger` affiché uniquement si `isDevMode()` est vrai.

### Écran de gestion des étudiants

- `StudentService` : `findAll()`, `create()`, `update()`, `delete()`.
- `StudentsComponent` (route `/students`, protégée par le guard) :
  - liste des étudiants avec sélection et détail ;
  - formulaire unique pour créer ou modifier un étudiant (bascule automatique selon le contexte) ;
  - suppression avec confirmation ;
  - messages de succès/erreur, état de chargement.

### Redirections logiques

- `RegisterComponent` : l'ancienne alerte navigateur (`alert('SUCCESS!! :-)')`) est supprimée. En cas de succès, une card de confirmation s'affiche avec un bouton « Accéder à la connexion » qui redirige vers `/login`. En cas d'échec, un message d'erreur s'affiche sans quitter le formulaire.
- `LoginComponent` : après une connexion réussie, redirection automatique vers `/students` (au lieu d'un simple message de succès).

### Habillage visuel

Un style sobre inspiré d'un registre universitaire (papier ivoire, vert profond, bordeaux, typographie serif pour les titres) a été appliqué à l'écran étudiants et à la barre de navigation, sans dépendance graphique supplémentaire.

## Tests et validations réalisés

- Build Angular : réussi (seul avertissement : budget de bundle initial, déjà présent avant cette étape).
- Tests Jest : **7/7 réussis**, avec mise à jour de :
  - `app.component.spec.ts` (ajout de `provideRouter([])` pour les liens de navigation) ;
  - `login.component.spec.ts` (le test de connexion réussie vérifie désormais la redirection vers `/students` plutôt qu'un message de succès).
- Vérification manuelle dans le navigateur :
  - `/` redirige vers `/login` ;
  - accès direct à `/students` sans authentification → redirection vers `/login` (guard) ;
  - inscription réussie → card de confirmation → redirection vers `/login` ;
  - connexion réussie → redirection vers `/students`, liste chargée ;
  - création, modification (avec resynchronisation du détail affiché) et suppression d'un étudiant testées de bout en bout via l'interface ;
  - lien Swagger visible dans le menu en mode développement.

## Point corrigé pendant la validation

Après modification d'un étudiant, le bandeau « Détail sélectionné » affichait encore l'ancienne valeur (référence non rafraîchie). Correction : `loadStudents()` resynchronise désormais `selectedStudent` avec les données récupérées après chaque rechargement de la liste.

## Limites restantes

- Pas de pagination ni de recherche sur la liste des étudiants.
- Pas de gestion des rôles : tout utilisateur authentifié peut gérer les étudiants.
- Le guard vérifie uniquement la présence d'un token, pas sa validité ni son expiration côté frontend (le backend reste la source de vérité via le `JwtAuthenticationFilter`).
