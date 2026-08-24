# Étape 4 — CRUD des étudiants côté back-end

## Objectif

Ajouter les APIs REST permettant de gérer les étudiants abonnés à la bibliothèque : création, consultation de la liste, consultation du détail, modification et suppression.

## Architecture retenue

Le code respecte le découpage en couches demandé par l'exercice :

```text
StudentController
       |
       v
StudentService
       |
       v
StudentRepository
       |
       v
Student (JPA / MySQL)
```

Les contrôleurs échangent exclusivement des DTO et ne renvoient pas directement l'entité JPA.

## Éléments ajoutés

### Modèle et persistance

- `Student` : entité JPA persistée dans la table `student`.
- `StudentRepository` : repository Spring Data basé sur `JpaRepository<Student, Long>`.
- Champs métier : `firstName`, `lastName`, `email`.
- Contraintes : prénom, nom et email obligatoires ; email validé avec `@Email`.
- `id`, `createdAt` et `updatedAt` sont générés ou gérés par le backend.

### DTO

- `StudentRequestDTO` : données reçues pour créer ou modifier un étudiant.
- `StudentResponseDTO` : données renvoyées au client, avec l'identifiant et les dates de suivi.

### Service

`StudentService` contient les traitements CRUD :

- `create()` ;
- `findAll()` ;
- `findById()` ;
- `update()` ;
- `delete()`.

Un étudiant inexistant produit une réponse `404 Not Found`.

### Contrôleur REST

Base URL : `/api/students`

| Méthode | Route | Réponse nominale |
|---|---|---|
| `POST` | `/api/students` | `201 Created` + étudiant créé |
| `GET` | `/api/students` | `200 OK` + liste |
| `GET` | `/api/students/{id}` | `200 OK` + détail |
| `PUT` | `/api/students/{id}` | `200 OK` + étudiant modifié |
| `DELETE` | `/api/students/{id}` | `204 No Content` |

Les endpoints sont visibles dans Swagger UI sous la section « Étudiants ».

## Sécurisation JWT

La configuration précédente exigeait déjà une authentification pour les routes non publiques, mais aucun filtre ne transformait réellement le Bearer Token en utilisateur authentifié. Cette étape ajoute donc :

- `JwtAuthenticationFilter`, exécuté avant le filtre d'authentification standard ;
- extraction et vérification de la signature, du sujet et de l'expiration dans `JwtService` ;
- déclaration du schéma `bearerAuth` dans OpenAPI ;
- annotation `@SecurityRequirement` sur le contrôleur étudiant ;
- accès public conservé pour l'inscription, la connexion, Swagger et Actuator.

Pour appeler une route étudiante dans Swagger :

1. exécuter `POST /api/login` et copier le JWT retourné ;
2. cliquer sur **Authorize** ;
3. saisir `Bearer <token>` ;
4. exécuter les routes de la section « Étudiants ».

Sans token, l'API retourne `401 Unauthorized`.

## Tests ajoutés

### Tests unitaires

`StudentServiceTest` couvre :

- la création et la persistance ;
- la lecture d'un étudiant ;
- la modification des champs ;
- la suppression ;
- le cas d'un étudiant inexistant.

Résultat : **5 tests sur 5 réussis**.

### Tests d'intégration

`UserControllerTest` couvre également :

- le refus de `GET /api/students` sans authentification ;
- un parcours complet création, lecture, modification et suppression avec un JWT valide.

La compilation de ces tests est validée. Leur exécution dépend de Testcontainers et du moteur Docker Desktop disponible sur la machine.

## Validation réalisée

- Compilation backend : réussie avec `mvn -DskipTests compile`.
- Compilation des tests : réussie avec `mvn -DskipTests test-compile`.
- Tests unitaires ciblés : **10/10 réussis**.
- Documentation OpenAPI enrichie avec les endpoints CRUD et l'authentification Bearer.

## Limites restantes

- Le frontend ne consomme pas encore les routes étudiants.
- La pagination, la recherche et le tri ne sont pas implémentés.
- Le rôle ou les permissions spécifiques des agents restent à définir ; pour l'instant, tout utilisateur authentifié peut accéder au CRUD.
- Le test d'intégration complet doit être rejoué lorsque Testcontainers pourra joindre correctement le moteur Docker Desktop.