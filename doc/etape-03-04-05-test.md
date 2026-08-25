# Étapes 03, 04 et 05 — Implémentation des tests

## Périmètre

Cette fiche récapitule les tests ajoutés après le plan de tests de l'étape 02. Les tests d'erreur déjà présents sont conservés afin de vérifier aussi les comportements non nominaux.

## Étape 03 — Tests backend

### Tests unitaires Java

- `UserServiceTest` vérifie l'inscription, le doublon, le rejet d'un utilisateur null, l'authentification valide et le rejet d'un mauvais mot de passe.
- `JwtServiceTest` vérifie le sujet, les dates, la signature et la validité d'un JWT.
- `StudentServiceTest` vérifie les opérations du service étudiant avec `StudentRepository` mocké : création, lecture, modification, suppression et étudiant inexistant.

### Tests d'intégration Java

`UserControllerTest` utilise JUnit, Spring Boot, MockMvc et Testcontainers avec une vraie instance MySQL temporaire. Il vérifie :

- inscription HTTP ;
- connexion avec émission d'un JWT ;
- rejet d'un mauvais mot de passe ;
- refus des routes étudiants sans token ;
- parcours CRUD étudiant avec `Authorization: Bearer <token>`.

Le test d'intégration est indépendant d'une base de développement : Testcontainers crée une base éphémère et les tests préparent leurs propres données.

## Étape 04 — Tests frontend unitaires et intégration

### Services et sécurité

Avec Jest et `HttpTestingController` :

- `StudentService` vérifie les méthodes GET, POST, PUT et DELETE et les DTO envoyés ;
- `authInterceptor` vérifie l'ajout de `Authorization: Bearer <token>` et son absence sans token ;
- `authGuard` vérifie l'autorisation avec token et la redirection vers `/login` sans token.

### Composants

- `LoginComponent` vérifie la validation, le stockage du JWT, la redirection et le message `401` ;
- `RegisterComponent` vérifie la confirmation d'inscription et le traitement d'erreur ;
- `StudentsComponent` vérifie le chargement, l'ajout, la modification, la suppression et l'erreur de chargement.

Les services HTTP sont mockés dans les tests de composants : ces tests ne dépendent pas d'une base de données.

## Étape 05 — Tests E2E Cypress

Cypress est installé et configuré dans `frontend/cypress.config.ts`. Les scénarios exécutent l'application Angular réelle dans un navigateur et utilisent le backend réel :

- utilisateur non authentifié → redirection vers `/login` ;
- inscription depuis l'interface → card de confirmation puis login ;
- connexion → redirection vers `/students` ;
- CRUD complet d'un étudiant depuis l'interface.

Les données préparatoires sont créées par API avec `cy.request()` lorsque le scénario ne teste pas l'inscription elle-même. Les interactions UI utilisent `cy.visit()`, `cy.get()`, `cy.type()` et les clics réels.

## Base de données E2E dédiée et idempotence

Pour éviter que Cypress utilise la base MySQL de développement, une base dédiée est définie dans `backend/compose.e2e.yaml` :

- projet Docker Compose : `etudiant-e2e` ;
- base : `etudiant_e2e` ;
- port hôte : `3307` ;
- volume de données : `tmpfs`, donc non persistant ;
- configuration Spring Boot : `application-e2e.yml` ;
- schéma JPA : `create-drop`.

Le cycle reproductible est :

```powershell
.\scripts\e2e.ps1
# démarrer le backend avec application-e2e.yml
npm --prefix frontend run e2e
.\scripts\e2e-clean.ps1
```

`scripts/e2e.ps1` commence par `docker compose down -v`, puis démarre une base neuve avec `up -d --wait`. `scripts/e2e-clean.ps1` supprime le conteneur, le réseau et les volumes du projet E2E. Les données des tests ne sont donc pas conservées entre deux campagnes et la base de développement n'est pas touchée.

Les logins Cypress restent uniques à l'intérieur d'une campagne pour éviter les collisions sur la contrainte SQL `login unique`. Cette unicité complète l'isolation de la base, mais ne la remplace pas.

## Résultats de validation

- backend : **17 tests sur 17 réussis** avec Testcontainers ;
- frontend Jest : **tests existants et tests ajoutés réussis** ;
- Cypress : **4 scénarios sur 4 réussis** ;
- build Angular : réussi, avec seulement l'avertissement de budget du bundle initial.

## Limites et suites possibles

- Les tests E2E nécessitent Angular et le backend démarrés, ainsi que Docker Desktop.
- L'installation Cypress signale des dépendances npm à auditer ultérieurement.
- Les données E2E sont isolées par environnement ; le nettoyage explicite reste recommandé après la campagne.
- Une pipeline CI pourra reproduire ce cycle avec Docker Compose et publier les rapports de tests.
