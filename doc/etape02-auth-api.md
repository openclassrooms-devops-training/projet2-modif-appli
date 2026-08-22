# Étape 2 — Correction de l'API d'authentification (`/api/login`)

## 1. Constat initial : un faux positif

Un test manuel de `/api/login` (via Postman ou navigateur) semblait « fonctionner » : la requête aboutissait sans erreur. C'était trompeur car **trois bugs cumulés faisaient que la route acceptait n'importe quel mot de passe**, tant que le login existait en base.

## 2. Analyse des bugs identifiés

| # | Fichier | Bug | Conséquence |
|---|---|---|---|
| 1 | `UserService.login()` | `passwordEncoder.matches(password, password)` compare le mot de passe **avec lui-même** au lieu de le comparer au hash stocké (`user.getPassword()`). L'`Optional<User>` récupéré n'est même pas utilisé pour le mot de passe. | N'importe quel mot de passe est accepté dès que le login existe → faille d'authentification critique. |
| 2 | `JwtService.generateToken()` | Méthode non implémentée, retournait `null` (`// TODO`). | Le token renvoyé au client était toujours `null`, même en cas de succès apparent. |
| 3 | `UserController.login()` | Le paramètre `LoginRequestDTO` n'avait pas l'annotation `@RequestBody`. | Spring ne désérialise pas le corps JSON de la requête ; les champs `login`/`password` restaient `null` côté serveur. |
| 4 | `LoginRequestDTO` | `@NotBlank` importé mais jamais appliqué aux champs. | `@Valid` sur le contrôleur n'avait aucun effet : un login/mot de passe vide n'était pas rejeté avec un message clair. |

C'est la combinaison des bugs 1 et 3 qui expliquait le « faux positif » : la requête passait (statut 200 ou proche), mais l'authentification réelle n'était jamais vérifiée.

## 3. Correctifs appliqués

### 3.1 `UserService.login()` — réutilisation de l'`AuthenticationManager` existant
Le projet définissait déjà `AuthenticationManager`, `DaoAuthenticationProvider`, `CustomUserDetailService` et `BCryptPasswordEncoder` dans [SpringSecurityConfig](../backend/src/main/java/com/openclassrooms/etudiant/configuration/security/SpringSecurityConfig.java), mais ces beans n'étaient pas utilisés par `login()`. La correction délègue l'authentification à l'`AuthenticationManager` :

```java
public String login(String login, String password) {
    Assert.notNull(login, "Login must not be null");
    Assert.notNull(password, "Password must not be null");

    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(login, password));

    return jwtService.generateToken((UserDetails) authentication.getPrincipal());
}
```
`AuthenticationManager` s'appuie sur `CustomUserDetailService` (chargement de l'utilisateur) et `BCryptPasswordEncoder` (comparaison du mot de passe en clair au hash BCrypt stocké), et lève automatiquement `BadCredentialsException` (→ 401, déjà géré par `RestExceptionHandler`) si le login est inconnu ou le mot de passe incorrect.

### 3.2 `JwtService` — génération d'un vrai JWT
Ajout de la dépendance [jjwt](https://github.com/jwtk/jjwt) (`jjwt-api`, `jjwt-impl`, `jjwt-jackson` v0.12.6) dans `pom.xml`. Le service signe désormais un token HMAC avec un secret et une expiration configurables (`jwt.secret`, `jwt.expiration-ms` dans `application.yml`, valeurs fournies via `.env`) :

```java
public String generateToken(UserDetails userDetails) {
    Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    Date now = new Date();
    Date expiration = new Date(now.getTime() + expirationMs);
    return Jwts.builder()
            .subject(userDetails.getUsername())
            .issuedAt(now)
            .expiration(expiration)
            .signWith(key)
            .compact();
}
```

### 3.3 `UserController` — désérialisation correcte du corps JSON
```java
@PostMapping("/api/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
    String jwtToken = userService.login(loginRequestDTO.getLogin(), loginRequestDTO.getPassword());
    return ResponseEntity.ok(jwtToken);
}
```

### 3.4 `LoginRequestDTO` — validation effective
Ajout de `@NotBlank` sur `login` et `password` pour que `@Valid` rejette bien une requête incomplète (400).

## 4. Preuves de fonctionnement

### 4.1 Tests automatisés (`mvn test`)
- `UserServiceTest` (unitaire, Mockito) : 5/5 tests passent, dont les 2 nouveaux :
  - `test_login_returns_token_on_valid_credentials` : l'`AuthenticationManager` mocké authentifie → un token est retourné.
  - `test_login_with_wrong_password_throws_BadCredentialsException` : l'`AuthenticationManager` lève `BadCredentialsException` → propagée telle quelle.
- `UserControllerTest` (intégration, Testcontainers + MockMvc) : ajout de `loginWithValidCredentialsReturnsToken` (attend `200`) et `loginWithWrongPasswordReturnsUnauthorized` (attend `401`).
  - ⚠️ Sur ce poste, ces tests d'intégration échouent avec `Could not find a valid Docker environment` : Testcontainers n'arrive pas à joindre le moteur Docker Desktop via named pipe (`docker_cli`/`docker_engine`), alors que `docker ps` fonctionne très bien en ligne de commande. C'est un problème d'environnement Windows/Docker Desktop propre à cette machine, préexistant à cette correction (déjà présent sur les tests de `register` avant modification) — pas un défaut du code corrigé.

### 4.2 Test manuel de bout en bout (backend lancé avec `mvn spring-boot:run`)
```jsonc
// 1) Inscription d'un agent
POST /api/register  {"firstName":"Alice","lastName":"Martin","login":"alice.martin","password":"S3curePwd!"}
→ 201 Created

// 2) Login avec le bon mot de passe
POST /api/login  {"login":"alice.martin","password":"S3curePwd!"}
→ 200 OK
→ eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhbGljZS5tYXJ0aW4i... (JWT valide, header HS384, subject = login)

// 3) Login avec un mauvais mot de passe
POST /api/login  {"login":"alice.martin","password":"WrongPassword!"}
→ 401 Unauthorized
```
Avant correction, le cas 3 aurait renvoyé un statut proche de 200 avec un token `null` — c'est exactement le faux positif observé initialement.

## 5. Documentation Swagger / OpenAPI

La dépendance `springdoc-openapi-starter-webmvc-ui` a été ajoutée au backend. La documentation interactive est disponible lorsque l'API est démarrée :

- Swagger UI : `http://localhost:8080/swagger-ui/index.html`
- Spécification OpenAPI JSON : `http://localhost:8080/v3/api-docs`

Les routes `POST /api/register` et `POST /api/login` sont regroupées sous la section « Authentification ». Swagger UI permet de consulter les schémas de requête, les statuts HTTP attendus et d'exécuter les appels directement avec le bouton « Try it out ».

## 6. Points de vigilance restants
- Le secret JWT (`JWT_SECRET`) est actuellement stocké dans `.env`, qui est **versionné dans Git** (déjà signalé dans [analyse-projet.md](analyse-projet.md)) : à déplacer hors du contrôle de version avant tout usage réel.
- Le problème Testcontainers/Docker Desktop (named pipe) empêche de valider `UserControllerTest` automatiquement sur ce poste ; à défaut, les tests unitaires + le test manuel ci-dessus couvrent le comportement attendu.
- Le front-end n'a toujours pas de page de login ni de gestion du token JWT (stockage, intercepteur HTTP, guard) — prochaine étape logique côté Angular.
