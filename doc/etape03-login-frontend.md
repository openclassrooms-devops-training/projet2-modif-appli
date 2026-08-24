# Étape 3 — Écran de connexion frontend

## Objectif

Ajouter un écran Angular permettant à un agent de saisir son login et son mot de passe, d'appeler l'API `POST /api/login` et de recevoir le token JWT produit par le backend.

## Réalisation

### Modèle et service

- Création de `frontend/src/app/core/models/Login.ts` avec les propriétés `login` et `password`.
- Ajout de `login()` dans `UserService`.
- Le service appelle `/api/login` via le proxy Angular et attend le JWT comme réponse texte.

### Composant

Création du composant standalone `LoginComponent`, accessible sur `/login` :

- formulaire réactif avec deux champs obligatoires ;
- champ mot de passe masqué avec `type="password"` ;
- validation côté client ;
- état de chargement qui désactive les boutons pendant l'appel ;
- message spécifique pour une réponse `401 Unauthorized` ;
- message générique pour les autres erreurs ;
- message de succès ;
- stockage du token dans `localStorage` sous la clé `authToken`.

### Routage

- La route `/login` pointe vers `LoginComponent`.
- La route racine `/` redirige vers `/login`, ce qui supprime la page blanche du démarrage observée avec l'ancienne route qui pointait vers `AppComponent` lui-même.

## Tests

Le fichier `login.component.spec.ts` couvre :

1. le rejet d'un formulaire vide ;
2. l'appel du service et le stockage du JWT en cas de succès ;
3. l'affichage d'une erreur en cas de réponse 401.

### Validation réalisée

- Tests ciblés : `3/3` réussis avec Jest.
- Tests frontend existants : `4/4` réussis avant l'ajout des tests du login.
- Build Angular : réussi.
- Vérification navigateur : `/login` affiche correctement le formulaire.

Le build signale uniquement un avertissement de budget sur le bundle initial, lié à la taille d'Angular Material (`631.88 kB` pour un budget de `500 kB`). Ce n'est pas une erreur bloquante.

## Limites restantes

- Le token est stocké mais aucun intercepteur HTTP ne l'ajoute encore dans l'en-tête `Authorization`.
- Aucun guard Angular ne protège encore les routes.
- La redirection après connexion réussie vers une page métier reste à définir.
- Le formulaire d'inscription conserve son ancien comportement d'alerte de succès.