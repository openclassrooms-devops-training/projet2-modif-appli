# Analyse du projet EtuBibliothèque

Document d'analyse du code de départ, avant ajout de nouvelles fonctionnalités et de tests.

## 1. Contexte

EtuBibliothèque permet de gérer les étudiants abonnés à une bibliothèque. Le projet est composé de 2 dépôts distincts, clonés à la racine de ce workspace :

| Dossier | Dépôt GitHub | Rôle |
|---|---|---|
| `backend/` | `Back-end---Testez-et-am-liorez-une-application-existante` | API REST (Spring Boot) |
| `frontend/` | `Front-end---Testez-et-am-liorez-une-application-existante` | Application web (Angular) |

Le code de départ ne permet que **d'enregistrer un agent de la bibliothèque** (formulaire d'inscription). L'authentification et le CRUD des étudiants sont à développer.

## 2. Back-end (`etudiant-backend`)

### 2.1 Stack technique
- Java 21, Spring Boot 3.5.5 (starters : `web`, `data-jpa`, `security`, `validation`, `actuator`)
- Base de données MySQL, démarrée via `spring-boot-docker-compose` + `compose.yaml` (nécessite Docker Desktop)
- Lombok (réduction du boilerplate), MapStruct (mapping DTO ↔ entité)
- Tests : JUnit 5, Mockito, AssertJ, Testcontainers (MySQL) pour les tests d'intégration
- Port par défaut : `8080`

### 2.2 Architecture (couches)
```
controller/   → UserController (endpoints REST)
dto/          → RegisterDTO, LoginRequestDTO
mapper/       → UserDtoMapper (MapStruct, DTO → entité)
service/      → UserService (logique métier), JwtService (génération de token)
repository/   → UserRepository (Spring Data JPA)
entities/     → User (entité JPA, implémente aussi UserDetails de Spring Security)
configuration/→ AppConfig (chargement du .env), SpringSecurityConfig, CustomUserDetailService, RequestLoggingFilterConfig
handler/      → RestExceptionHandler + ErrorDetails (gestion centralisée des erreurs)
```

### 2.3 Fonctionnalités existantes
- **`POST /api/register`** : inscription d'un agent (`firstName`, `lastName`, `login`, `password`). Vérifie l'unicité du login, encode le mot de passe (BCrypt) et persiste l'utilisateur. Retourne `201 Created`, ou `400` si le login existe déjà ou si des champs obligatoires sont manquants (validation Bean Validation `@NotBlank`).
- **`POST /api/login`** : présent mais **non fonctionnel** (voir anomalies ci-dessous).
- Sécurité : session stateless, routes `/api/register`, `/api/login` et `/actuator/**` publiques, tout le reste nécessite une authentification (pas encore de filtre JWT branché).
- Configuration DB externalisée dans `.env` (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`), chargée via `AppConfig`.
- Logging des requêtes HTTP (`CommonsRequestLoggingFilter`).
- Gestion des erreurs centralisée (`@RestControllerAdvice`) : 400 (arguments invalides), 401 (credentials invalides), 403 (accès refusé), 500 (défaut).

### 2.4 Tests existants
- `UserServiceTest` (unitaire, Mockito) : couvre `register()` (utilisateur null, login déjà existant, cas nominal).
- `UserControllerTest` (intégration, Testcontainers + MockMvc) : couvre `POST /api/register` (données manquantes, doublon, cas nominal).
- **Aucun test** sur `login()` / `JwtService`, ni sur la sécurité.

### 2.5 Anomalies et points d'attention identifiés

| # | Fichier | Problème | Impact |
|---|---|---|---|
| 1 | [UserService.java](backend/src/main/java/com/openclassrooms/etudiant/service/UserService.java) | `login()` appelle `passwordEncoder.matches(password, password)` : compare le mot de passe **avec lui-même**, pas avec le hash stocké en base (`user.getPassword()`). | N'importe quel mot de passe est accepté dès que le login existe : faille d'authentification critique. |
| 2 | [JwtService.java](backend/src/main/java/com/openclassrooms/etudiant/service/JwtService.java) | `generateToken()` retourne `null` (TODO non implémenté). | Le endpoint `/api/login` ne peut renvoyer de token JWT exploitable. |
| 3 | [UserController.java](backend/src/main/java/com/openclassrooms/etudiant/controller/UserController.java) | Le paramètre de `login()` n'a pas d'annotation `@RequestBody`. | Spring MVC tentera un data binding classique (query/form params) et non un désérialisation JSON : l'appel JSON attendu par le front échouera probablement. |
| 4 | `.env` (backend, racine) | Fichier de credentials **versionné dans Git** (non listé dans `.gitignore`). | Mauvaise pratique de sécurité (à corriger avant tout usage hors formation, même si ce sont des identifiants de dev locaux). |
| 5 | [SpringSecurityConfig.java](backend/src/main/java/com/openclassrooms/etudiant/configuration/security/SpringSecurityConfig.java) | CORS explicitement désactivé (`.cors(AbstractHttpConfigurer::disable)`). | Fonctionne uniquement car le front utilise un proxy Angular (`proxy.conf.json`) en dev ; à revoir si déploiement avec des origines distinctes sans proxy. |
| 6 | Entité `User` | Implémente directement `UserDetails` (mélange entité JPA / modèle de sécurité Spring). | Couplage fort entre persistance et sécurité, à surveiller si le modèle évolue (ex. ajout de rôles). |

## 3. Front-end (`etudiant-frontend`)

### 3.1 Stack technique
- Angular 19 (composants **standalone**), Angular CLI 19.2.16
- Angular Material + Angular CDK (UI), Reactive Forms
- Tests unitaires : Jest (`jest-preset-angular`), pas de tests e2e configurés
- Proxy de dev (`proxy.conf.json`) : redirige `/api` vers `http://localhost:8080` (backend)

### 3.2 Architecture
```
app/
  app.component.ts/html   → shell racine (router-outlet uniquement)
  app.routes.ts           → routes : '' → AppComponent, 'register' → RegisterComponent
  app.config.ts           → providers globaux (HttpClient, Router, ZoneChangeDetection)
  core/
    models/Register.ts        → interface Register (firstName, lastName, login, password)
    service/user.service.ts   → UserService : POST /api/register
    service/user-mock.service.ts → mock utilisé dans les tests (register() → Observable vide)
  pages/register/          → RegisterComponent (formulaire réactif + validation required)
  shared/material.module.ts→ regroupement des modules Angular Material utilisés
```

### 3.3 Fonctionnalités existantes
- Formulaire d'inscription (`RegisterComponent`) avec validation `required` sur les 4 champs, retour visuel des erreurs (`is-invalid`).
- Soumission : appelle `UserService.register()`, affiche une alerte JS `SUCCESS!!` en cas de succès. Pas de gestion des erreurs HTTP (pas de `error:` dans le `subscribe`), pas de redirection après succès (TODO explicite dans le code vers une page de login à venir).
- Aucune page/formulaire de login côté front pour l'instant (alors que le back-end expose déjà `/api/login`).

### 3.4 Tests existants
- `app.component.spec.ts`, `user.service.spec.ts`, `register.component.spec.ts` : tests de création de base (« should be created / should create »), pas de test fonctionnel sur la soumission du formulaire, la validation ou les cas d'erreur HTTP.

### 3.5 Anomalies et points d'attention identifiés

| # | Fichier | Problème | Impact |
|---|---|---|---|
| 1 | [register.component.ts](frontend/src/app/pages/register/register.component.ts) | `subscribe()` ne définit pas de callback `error`. | En cas d'échec de l'API (ex. login déjà pris → 400), l'utilisateur n'a aucun retour ; erreur silencieuse dans la console navigateur. |
| 2 | [register.component.html](frontend/src/app/pages/register/register.component.html) | Champ `password` déclaré en `type="text"` au lieu de `type="password"`. | Le mot de passe s'affiche en clair à l'écran. |
| 3 | [register.component.spec.ts](frontend/src/app/pages/register/register.component.spec.ts) | `{ provide: UserService, useValue: UserMockService }` fournit la **classe** et non une **instance** du mock. | Le mock n'est pas réellement substitué correctement (aucune méthode `register` utilisable tel quel) ; à corriger (`useValue: new UserMockService()` ou `useClass: UserMockService`). |
| 4 | Global | Pas de gestion d'état d'authentification (token JWT non stocké, pas d'`AuthGuard`, pas d'intercepteur HTTP pour ajouter le header `Authorization`). | Cohérent avec le fait que login/JWT ne sont pas encore fonctionnels côté back, mais à prévoir dès l'implémentation. |

## 4. Synthèse des fonctionnalités à développer

D'après les README des deux dépôts et l'état du code :

1. **Authentification** :
   - Corriger `UserService.login()` (comparer le mot de passe en clair au hash stocké, pas à lui-même).
   - Implémenter `JwtService.generateToken()` (génération réelle d'un JWT signé).
   - Ajouter `@RequestBody` sur le endpoint `/api/login`.
   - Créer un filtre d'authentification JWT côté Spring Security (le commentaire `// .addFilterBefore(authenticationFilter, ...)` dans `SpringSecurityConfig` indique que c'est prévu).
   - Créer un formulaire de login côté Angular + stockage du token + intercepteur HTTP + guard de route.
2. **CRUD des étudiants** : à créer entièrement (entité, repository, service, contrôleur côté back ; modèle, service, pages liste/formulaire côté front) — actuellement seul le CRUD utilisateur/agent existe.
3. **Corrections mineures** recommandées avant d'ajouter des fonctionnalités : type `password` en front, gestion d'erreur HTTP dans `RegisterComponent`, correction du mock dans les tests, retrait du `.env` du contrôle de version (utiliser `.env.example` + `.gitignore`).
4. **Tests** : compléter la couverture (login, JwtService, sécurité, cas d'erreur front, soumission de formulaire) avant/au fur et à mesure de l'ajout des fonctionnalités (TDD recommandé vu le contexte de formation « Testez et améliorez une application existante »).

## 5. Procédure de démarrage (rappel README)

**Back-end** (voir [backend/README.md](backend/README.md)) :
1. Démarrer Docker Desktop.
2. `mvn spring-boot:run` à la racine de `backend/` → crée le container MySQL (via `compose.yaml`) et démarre l'API sur le port `8080`.
3. Les credentials DB sont dans `.env`, référencés dans `application.yml`.
4. Tests : `mvn clean test` (nécessite aussi Docker pour Testcontainers).

**Front-end** (voir [frontend/README.md](frontend/README.md)) :
1. `npm install` à la racine de `frontend/`.
2. `npm run start` (`ng serve`) → sert l'app sur `http://localhost:4200`, avec proxy `/api` vers `http://localhost:8080`.
3. Tests unitaires : `npm test` (Jest).
