# Guide de déploiement

Ce guide permet de cloner le dépôt et de lancer l'application complète (backend + frontend + base de données) en local, sans connaissance préalable du projet.

## 1. Prérequis

- **Git**
- **Java JDK 21**
- **Maven 3.9** ou supérieur
- **Node.js** et **npm**
- **Docker Desktop**, démarré — nécessaire pour la base MySQL de développement et pour les tests d'intégration (Testcontainers)

## 2. Cloner le dépôt

```bash
git clone <url-du-depot>
cd projet2-modif-appli
```

## 3. Configuration

### Backend

Le fichier `backend/.env` n'est **pas versionné** (il ne doit jamais l'être, même avec des valeurs de développement). Le copier depuis le modèle fourni :

```bash
cp backend/.env.example backend/.env
```

Puis remplacer la valeur de `JWT_SECRET` par une valeur aléatoire propre à votre poste, par exemple :

```bash
openssl rand -hex 32
```

Coller le résultat dans `backend/.env` à la place de `change-me`. Les autres valeurs (`DB_*`) peuvent rester telles quelles pour un usage local. **Ne jamais utiliser ces valeurs en production.**

### Frontend

Le fichier `frontend/proxy.conf.json` redirige déjà les appels `/api` vers `http://localhost:8080` — aucune configuration supplémentaire n'est nécessaire.

## 4. Lancer le backend

```bash
cd backend
mvn spring-boot:run
```

- L'API démarre sur **http://localhost:8080**.
- Le conteneur MySQL de développement démarre automatiquement (`backend/compose.yaml`, via l'intégration Docker Compose de Spring Boot) — inutile de lancer `docker compose` manuellement.
- Documentation interactive de l'API (Swagger UI) : **http://localhost:8080/swagger-ui/index.html**

## 5. Lancer le frontend

Dans un second terminal, depuis la racine du dépôt :

```bash
cd frontend
npm install
npm start
```

- L'application démarre sur **http://localhost:4200**.

## 6. Vérifier que tout fonctionne

1. Ouvrir [http://localhost:4200/register](http://localhost:4200/register) et créer un compte agent (prénom, nom, login, mot de passe).
2. Se connecter sur [http://localhost:4200/login](http://localhost:4200/login) avec ce compte.
3. Vérifier l'accès à la liste des étudiants sur [http://localhost:4200/students](http://localhost:4200/students).

Si ces trois étapes fonctionnent, le déploiement local est opérationnel.

## 7. Lancer les tests (optionnel)

### Backend (JUnit, Mockito, Testcontainers)

```bash
cd backend
mvn test
```

Rapport de couverture (JaCoCo) généré automatiquement : `backend/target/site/jacoco/index.html`
Un instantané de ce rapport est aussi committé dans le dépôt et consultable en ligne (GitHub Pages) : https://openclassrooms-devops-training.github.io/projet2-modif-appli/backend/coverage-report/index.html

### Frontend (Jest)

```bash
cd frontend
npm test
```

Rapport de couverture généré automatiquement : `frontend/coverage/index.html`
Un instantané de ce rapport est aussi committé dans le dépôt et consultable en ligne (GitHub Pages) : https://openclassrooms-devops-training.github.io/projet2-modif-appli/frontend/coverage-report/index.html

### Tests end-to-end (Cypress)

```powershell
# 1. Démarrer une base MySQL dédiée aux tests e2e (port 3307)
.\scripts\e2e.ps1

# 2. Démarrer le backend avec le profil e2e (dans un terminal dédié)
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=e2e"

# 3. Lancer Cypress (frontend + backend e2e déjà démarrés)
cd frontend
npm run e2e            # mode headless
npm run e2e:open       # interface graphique

# 4. Nettoyer la base e2e une fois terminé
.\scripts\e2e-clean.ps1
```

## 8. Problèmes fréquents

| Symptôme | Cause probable |
|---|---|
| `mvn test` échoue avec `Could not find a valid Docker environment` | Docker Desktop n'est pas démarré |
| Le backend ne démarre pas / erreur de connexion MySQL | Docker Desktop n'est pas démarré (le conteneur MySQL de dev ne peut pas se lancer) |
| `Port 8080 already in use` ou `Port 4200 already in use` | Une instance précédente tourne déjà — l'arrêter avant de relancer |
| Une modification du code backend ne semble pas prise en compte | Java ne recharge pas le code à chaud — il faut arrêter (Ctrl+C) et relancer `mvn spring-boot:run` |

## Pour aller plus loin

- [README.md](../README.md) (racine) : description fonctionnelle complète du projet et routes de l'API.
- [backend/README.md](../backend/README.md) : guide détaillé du backend.
- [frontend/README.md](../frontend/README.md) : guide détaillé du frontend Angular.
