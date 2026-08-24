# EtuBibliothèque

Monorepo du projet EtuBibliothèque, réalisé dans le cadre de la formation OpenClassrooms **Testez et améliorez une application existante**.

L'application permet de gérer les agents et les étudiants abonnés à une bibliothèque. Elle est composée de deux applications :

- `backend/` : API REST Java / Spring Boot ;
- `frontend/` : application web Angular.

Le dossier `doc/` contient les analyses et comptes rendus des étapes réalisées.

## Architecture actuelle

```text
Navigateur
    |
    | http://localhost:4200
    v
Frontend Angular (bare metal)
    |
    | proxy /api -> http://localhost:8080
    v
Backend Spring Boot (bare metal)
    |
    | JDBC
    v
MySQL (conteneur Docker)
```

Dans la configuration actuelle, seul MySQL est exécuté dans Docker. Le backend et le frontend sont lancés localement avec Maven et npm.

## Prérequis

- Git ;
- Java JDK 21 ;
- Maven 3.9 ou supérieur ;
- Node.js et npm ;
- Docker Desktop démarré.

Docker Desktop est nécessaire pour lancer MySQL et pour les tests d'intégration utilisant Testcontainers.

## Démarrage rapide

### 1. Démarrer le backend

Depuis la racine du monorepo :

```powershell
cd backend
mvn spring-boot:run
```

Le backend démarre sur : http://localhost:8080

Le fichier `backend/compose.yaml` démarre automatiquement le conteneur MySQL via l'intégration Docker Compose de Spring Boot. Les paramètres de connexion sont définis dans `backend/.env` et utilisés par `backend/src/main/resources/application.yml`.

### 2. Démarrer le frontend

Dans un autre terminal :

```powershell
cd frontend
npm install
npm run start
```

Le frontend démarre sur : http://localhost:4200

La configuration [frontend/proxy.conf.json](frontend/proxy.conf.json) redirige les appels `/api` vers le backend sur le port `8080`.

### 3. Accéder à l'application

- Accueil : http://localhost:4200/
- Connexion : http://localhost:4200/login
- Formulaire d'inscription : http://localhost:4200/register
- Gestion des étudiants (connexion requise) : http://localhost:4200/students
- API backend : http://localhost:8080
- Swagger UI : http://localhost:8080/swagger-ui/index.html
- Spécification OpenAPI JSON : http://localhost:8080/v3/api-docs

### API étudiants

Les routes suivantes sont protégées par un Bearer Token JWT :

| Méthode | Route | Action |
|---|---|---|
| `POST` | `/api/students` | Ajouter un étudiant |
| `GET` | `/api/students` | Consulter la liste |
| `GET` | `/api/students/{id}` | Consulter le détail |
| `PUT` | `/api/students/{id}` | Modifier un étudiant |
| `DELETE` | `/api/students/{id}` | Supprimer un étudiant |

## Tester l'API avec Swagger

Dans Swagger UI :

1. Déplier `POST /api/register` puis cliquer sur **Try it out**.
2. Envoyer un compte agent avec un login inédit :

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "login": "jean.dupont",
  "password": "MotDePasse123!"
}
```

3. Vérifier la réponse `201 Created`.
4. Déplier `POST /api/login` et envoyer les mêmes identifiants.
5. Vérifier la réponse `200 OK` contenant un token JWT.
6. Refaire l'appel avec un mauvais mot de passe et vérifier la réponse `401 Unauthorized`.

Les endpoints d'inscription et de connexion sont publics. Les autres routes nécessitent une authentification, même si le filtre JWT et les routes métier restent à compléter dans les prochaines étapes.

Le formulaire frontend de connexion est disponible sur `/login`. Après une réponse réussie, le token est stocké localement sous la clé `authToken`.

Depuis l'étape 5, le frontend consomme entièrement les APIs étudiants :

- l'inscription réussie affiche une card de confirmation puis redirige vers `/login` ;
- la connexion réussie redirige automatiquement vers `/students` ;
- toutes les requêtes vers `/api/**` reçoivent automatiquement l'en-tête `Authorization: Bearer <token>` grâce à un intercepteur HTTP ;
- la route `/students` est protégée par un guard Angular : sans token, l'utilisateur est renvoyé vers `/login` ;
- une barre de menu permanente donne accès à Étudiants, Inscription, Déconnexion, et un lien Swagger visible uniquement lorsque l'application tourne en mode développement (`isDevMode()`).

## Tests

### Backend

```powershell
cd backend
mvn test
```

Les tests d'intégration utilisent Testcontainers et nécessitent que Docker Desktop soit démarré.

> **Note (résolu le 24/08/2026)** : sur ce projet, `UserControllerTest` échouait avec `Could not find a valid Docker environment` alors que `docker ps`/`docker info` fonctionnaient normalement. La cause n'était pas Docker Desktop, mais l'ancienne version **Testcontainers 1.20.0**, incompatible avec l'API Docker Desktop récente. Correction : mise à niveau vers **Testcontainers 2.0.5**, avec les nouveaux noms d'artefacts introduits en 2.x (`testcontainers-junit-jupiter` au lieu de `junit-jupiter`, `testcontainers-mysql` au lieu de `mysql`) et le nouveau package `org.testcontainers.mysql.MySQLContainer` (au lieu de `org.testcontainers.containers.MySQLContainer`). Après cette mise à niveau, `mvn test` passe normalement (`17/17` tests), sans configuration Docker particulière.

### Frontend

```powershell
cd frontend
npm test
```

Le frontend utilise Jest. Des tests fonctionnels complémentaires seront ajoutés au fil des étapes.

## Git et progression par étapes

Le dépôt racine est le dépôt Git unique du monorepo. Les dossiers `backend/` et `frontend/` ne sont plus des dépôts indépendants.

L'historique actuel est organisé ainsi :

```text
13b226e État initial des applications backend et frontend
1493d5c Étape 2 : corriger authentification et documenter API
```

À la fin de chaque étape :

```powershell
git status
git add .
git commit -m "Étape N : description des changements"
git push
```

## Documentation du projet

- [Analyse initiale](doc/analyse-projet.md)
- [Étape 2 : authentification et Swagger](doc/etape02-auth-api.md)
- [Étape 3 : écran de connexion frontend](doc/etape03-login-frontend.md)
- [Étape 4 : CRUD étudiants backend](doc/etape04-crud-etudiants-backend.md)
- [Étape 5 : écrans CRUD étudiants et navigation](doc/etape05-crud-etudiants-frontend.md)
- [Guide détaillé du backend](backend/README.md)
- [Guide Angular](frontend/README.md)

## Docker : état actuel et évolution recommandée

### Configuration actuelle

La configuration fournie par le projet est adaptée au développement :

- MySQL est isolé dans un conteneur Docker ;
- Spring Boot est lancé localement pour faciliter le debug et les tests ;
- Angular est lancé localement avec son serveur de développement et son rechargement à chaud.

Cette organisation est pratique pendant la formation, car les logs et les points d'arrêt du code restent directement accessibles dans VS Code.

### Faut-il conteneuriser les trois tiers ?

Pour un environnement reproductible ou un déploiement, oui, un Docker Compose complet serait une bonne évolution. Il pourrait orchestrer :

- `frontend` : image Angular compilée puis servie par Nginx ;
- `backend` : image Java contenant le fichier JAR Spring Boot ;
- `mysql` : base de données avec volume persistant.

Les bénéfices seraient :

- démarrage identique pour tous les développeurs ;
- versions Java, Node, Nginx et MySQL figées ;
- environnement proche de la production ;
- déploiement simplifié sur une machine ou un serveur.

Il faut toutefois distinguer deux usages :

- **développement** : conserver Angular et Spring Boot en local permet un meilleur confort de debug ;
- **intégration ou production** : utiliser trois images Docker est préférable.

La prochaine évolution Docker devrait donc ajouter des `Dockerfile` pour le backend et le frontend, puis un `compose.yaml` racine. Ce changement constituera une étape dédiée afin de pouvoir tester séparément le build, le réseau entre services, la persistance MySQL et la configuration des variables d'environnement.

## Points de vigilance

- Ne pas utiliser les credentials présents dans `backend/.env` en production.
- Le secret JWT doit être fourni par un mécanisme de secrets et ne doit pas être exposé dans un dépôt public.
- Le filtre de validation des tokens JWT reste à implémenter avant de protéger les futures routes métier.
- Le CRUD des étudiants et l'interface de connexion restent à développer.
