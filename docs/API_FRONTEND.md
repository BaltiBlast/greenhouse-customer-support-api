# Contrat d'intégration frontend de l'API Greenhouse Customer Support

Cette documentation décrit le contrat HTTP actuellement implémenté par l'API.
Elle est destinée au frontend. Le frontend ne communique pas directement avec
MongoDB : il envoie des requêtes à cette API, qui contrôle l'accès aux données.

## 1. Configuration générale

### URL de base

L'API monte toutes ses routes sous le préfixe `/api`.

```js
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
```

Exemples :

- développement local : `http://localhost:3000/api` ;
- production : utiliser l'URL publique du service API, suivie de `/api`.

L'URL publique de production n'est pas définie dans le dépôt et doit rester une
variable d'environnement du frontend.

### Format des échanges

- Les corps envoyés sont au format JSON.
- Ajouter `Content-Type: application/json` aux requêtes qui ont un corps.
- Les dates retournées par l'API sont sérialisées au format ISO 8601 UTC, par
  exemple `2026-10-15T00:00:00.000Z`.
- Les identifiants sont des identifiants MongoDB de 24 caractères
  hexadécimaux.
- Les propriétés inconnues dans un corps JSON sont refusées.
- Il n'existe actuellement ni pagination, ni filtre, ni tri configurable.

### Authentification par session

L'authentification repose sur le cookie de session HTTP-only `greenhouse.sid`.
Le frontend ne doit ni lire ni stocker ce cookie lui-même. Le navigateur doit
l'envoyer avec chaque appel, y compris lors de la connexion :

```js
const response = await fetch(`${API_BASE_URL}/auth/me`, {
  credentials: "include",
});
```

Avec Axios, utiliser `withCredentials: true`.

La session expire huit heures après sa création. Toutes les routes clients,
événements et mesures exigent une session active. Une absence de session ou une
session expirée produit une réponse `401`.

En production, le frontend et l'API doivent être servis en HTTPS pour permettre
l'utilisation du cookie cross-site sécurisé.

### CORS et protection des écritures

L'API autorise les requêtes cross-origin avec credentials uniquement depuis
l'origine configurée dans `FRONTEND_URL`.

Pour `POST`, `PUT`, `PATCH` et `DELETE`, le navigateur doit envoyer
automatiquement un en-tête `Origin` égal exactement à cette origine. Sinon,
l'API répond :

```http
403 Forbidden
```

```json
{
  "message": "L'origine de la requête n'est pas autorisée."
}
```

Le frontend n'a pas de jeton CSRF à récupérer ou à ajouter actuellement.

### Fonction utilitaire recommandée

```js
export async function apiRequest(path, options = {}) {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "La requête a échoué.");
    error.status = response.status;
    error.details = data.errors || [];
    throw error;
  }

  return data;
}
```

Exemple d'appel avec un corps :

```js
const client = await apiRequest("/clients", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

## 2. Format des erreurs

Toutes les erreurs contiennent au minimum un message :

```json
{
  "message": "Les données du client sont invalides."
}
```

Une erreur de validation peut également contenir `errors` :

```json
{
  "message": "Les données du client sont invalides.",
  "errors": [
    {
      "field": "birthDate",
      "message": "La date de naissance est invalide."
    }
  ]
}
```

Le champ `field` peut être une chaîne vide lorsqu'une règle concerne l'objet
complet plutôt qu'une propriété particulière.

Statuts communs :

| Statut | Signification |
| --- | --- |
| `400` | Paramètre ou corps JSON invalide |
| `401` | Authentification absente, invalide ou expirée |
| `403` | Origine de la requête d'écriture non autorisée |
| `404` | Ressource inexistante ou non accessible à l'utilisateur |
| `409` | Conflit avec une ressource existante |
| `500` | Erreur interne inattendue |

Pour éviter de révéler l'existence des données d'un autre compte, une ressource
appartenant à un autre utilisateur est généralement traitée comme introuvable.

## 3. Authentification

Il n'existe pas de route publique d'inscription dans cette API.

### Se connecter

```http
POST /api/auth/login
Content-Type: application/json
```

Corps obligatoire :

```json
{
  "email": "coach@example.com",
  "password": "mot-de-passe"
}
```

Règles :

- `email` doit être une adresse valide ;
- l'adresse est nettoyée, puis convertie en minuscules ;
- `password` doit être une chaîne non vide ;
- aucun autre champ n'est accepté.

Réponse `200` :

```json
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Camille",
  "lastName": "Martin",
  "email": "coach@example.com"
}
```

Erreurs propres à cette route :

- `400` : format des identifiants invalide ;
- `401` : adresse email ou mot de passe incorrect.

Le navigateur reçoit le cookie de session dans la réponse. Il faut donc utiliser
`credentials: "include"` dès cette requête.

### Lire l'utilisateur connecté

```http
GET /api/auth/me
```

La réponse `200` utilise le même format utilisateur que la connexion.

Réponse `401` si aucune session valide n'existe :

```json
{
  "message": "Aucune session active."
}
```

Cette route est adaptée à la restauration de la session au chargement du
frontend.

### Se déconnecter

```http
POST /api/auth/logout
```

- Réponse `204` sans corps.
- La session serveur est détruite et le cookie est supprimé.
- La route reste idempotente du point de vue du frontend : elle peut être
  appelée même si aucune session utilisateur active n'est connue côté client.

## 4. Clients

Toutes les routes de cette section exigent une session active. Un utilisateur
ne peut lire ou modifier que ses propres clients.

### Modèle reçu par le frontend

```json
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Camille",
  "lastName": "Martin",
  "birthDate": "1992-03-14T00:00:00.000Z",
  "height": 168,
  "objectives": "Améliorer la condition physique générale",
  "pathologies": [],
  "limitations": "Éviter les impacts",
  "hasEatingDisorder": false,
  "emergencyContact": {
    "name": "Julien Martin",
    "relationship": "Conjoint",
    "phone": "0600000001"
  },
  "createdAt": "2026-09-29T10:00:00.000Z",
  "updatedAt": "2026-09-29T10:00:00.000Z"
}
```

Les propriétés facultatives absentes ne doivent pas être supposées présentes.
Le champ interne `ownerId` n'est jamais retourné.

Attention : le contact d'urgence est envoyé à l'API sous forme de trois champs
plats, mais il est retourné sous la propriété imbriquée `emergencyContact`.

### Champs acceptés en écriture

| Champ | Type | Création | Règles |
| --- | --- | --- | --- |
| `firstName` | chaîne | obligatoire | Texte non vide après nettoyage |
| `lastName` | chaîne | obligatoire | Texte non vide après nettoyage |
| `birthDate` | chaîne | obligatoire | Date exacte au format `YYYY-MM-DD` |
| `height` | entier | facultatif | Strictement positif |
| `objectives` | chaîne | facultatif | Une chaîne vide supprime la valeur |
| `pathologies` | chaîne[] | facultatif | `[]` par défaut, éléments vides retirés |
| `limitations` | chaîne | facultatif | Une chaîne vide supprime la valeur |
| `hasEatingDisorder` | booléen | facultatif | `false` par défaut |
| `emergencyContactName` | chaîne | facultatif | Une chaîne vide supprime la sous-valeur |
| `emergencyContactRelationship` | chaîne | facultatif | Une chaîne vide supprime la sous-valeur |
| `emergencyContactPhone` | chaîne | facultatif | Une chaîne vide supprime la sous-valeur |

Ne jamais envoyer `id`, `ownerId`, `createdAt`, `updatedAt` ou
`emergencyContact` dans un corps de requête.

### Lister les clients

```http
GET /api/clients
```

- Aucun paramètre et aucun corps.
- Réponse `200` : tableau de clients, éventuellement vide.
- L'ordre du tableau n'est pas garanti par l'API.

### Lire un client

```http
GET /api/clients/:clientId
```

- Réponse `200` : client demandé.
- Réponse `400` : `clientId` invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

### Créer un client

```http
POST /api/clients
Content-Type: application/json
```

Exemple :

```json
{
  "firstName": "Camille",
  "lastName": "Martin",
  "birthDate": "1992-03-14",
  "height": 168,
  "objectives": "Améliorer la condition physique générale",
  "pathologies": [],
  "limitations": "",
  "hasEatingDisorder": false,
  "emergencyContactName": "Julien Martin",
  "emergencyContactRelationship": "Conjoint",
  "emergencyContactPhone": "0600000001"
}
```

- Réponse `201` : `{ "id": "identifiant créé" }`.
- Réponse `400` : corps invalide.

### Modifier partiellement un client

```http
PATCH /api/clients/:clientId
Content-Type: application/json
```

Envoyer uniquement les champs à modifier. Au moins un champ est obligatoire.

```json
{
  "height": 169,
  "objectives": "Préparer une course"
}
```

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant ou corps invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

### Supprimer un client

```http
DELETE /api/clients/:clientId
```

- Réponse `204` sans corps.
- Réponse `400` : `clientId` invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

La suppression retire également toutes les mesures du client et tous ses
événements de type `coaching`. Elle ne supprime aucun cours collectif.

## 5. Événements

Toutes les routes de cette section exigent une session active. Un utilisateur
ne peut lire ou modifier que ses propres événements.

### Modèle d'un événement

Champs communs :

| Champ | Type | Règles |
| --- | --- | --- |
| `type` | chaîne | `coaching` ou `group-class` |
| `date` | chaîne | En écriture `YYYY-MM-DD`, en réponse date ISO UTC |
| `startTime` | chaîne | Heure `HH:mm` entre `00:00` et `23:59` |
| `duration` | entier | Strictement positif |
| `location` | chaîne | Texte non vide |
| `description` | chaîne | Texte non vide |

Règles conditionnelles :

- un `coaching` exige `clientId` et interdit `className` ;
- le client du coaching doit appartenir à l'utilisateur connecté ;
- un `group-class` exige `className` et interdit `clientId`.

Les réponses ajoutent `id`, `createdAt` et `updatedAt`. Elles n'exposent pas
`ownerId`.

### Lister les événements

```http
GET /api/events
```

- Aucun paramètre et aucun corps.
- Réponse `200` : tableau d'événements, éventuellement vide.
- L'ordre du tableau n'est pas garanti par l'API.

Exemple de réponse :

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "type": "coaching",
    "date": "2026-10-15T00:00:00.000Z",
    "startTime": "09:30",
    "duration": 60,
    "location": "Salle 1",
    "description": "Séance individuelle",
    "clientId": "507f1f77bcf86cd799439012",
    "createdAt": "2026-09-29T10:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z"
  }
]
```

### Lire un événement

```http
GET /api/events/:eventId
```

- Réponse `200` : événement demandé.
- Réponse `400` : `eventId` invalide.
- Réponse `404` : événement introuvable ou appartenant à un autre utilisateur.

### Créer un coaching

```http
POST /api/events
Content-Type: application/json
```

```json
{
  "type": "coaching",
  "date": "2026-10-15",
  "startTime": "09:30",
  "duration": 60,
  "location": "Salle 1",
  "description": "Séance individuelle",
  "clientId": "507f1f77bcf86cd799439012"
}
```

### Créer un cours collectif

```http
POST /api/events
Content-Type: application/json
```

```json
{
  "type": "group-class",
  "date": "2026-10-16",
  "startTime": "18:00",
  "duration": 45,
  "location": "Studio principal",
  "description": "Cours collectif du soir",
  "className": "Mobilité"
}
```

Pour les deux types :

- réponse `201` : `{ "id": "identifiant créé" }` ;
- réponse `400` : corps invalide, combinaison incohérente ou client associé
  introuvable.

### Modifier partiellement un événement

```http
PATCH /api/events/:eventId
Content-Type: application/json
```

Envoyer uniquement les champs à modifier. Au moins un champ est obligatoire.

```json
{
  "startTime": "10:00",
  "location": "Salle 2"
}
```

Lors d'un changement de type, fournir le champ exigé par le nouveau type. Le
champ devenu incompatible est supprimé automatiquement :

```json
{
  "type": "group-class",
  "className": "Renforcement collectif"
}
```

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant, corps, combinaison ou client associé invalide.
- Réponse `404` : événement introuvable ou appartenant à un autre utilisateur.

### Supprimer un événement

```http
DELETE /api/events/:eventId
```

- Réponse `204` sans corps.
- Réponse `400` : `eventId` invalide.
- Réponse `404` : événement introuvable ou appartenant à un autre utilisateur.

## 6. Mesures

Les mesures sont toujours manipulées sous un client :

```text
/api/clients/:clientId/measurements
```

Toutes les routes exigent une session active. Avant chaque opération, l'API
vérifie que le client appartient à l'utilisateur connecté. `clientId` doit être
placé dans l'URL et ne doit jamais être envoyé dans le corps JSON.

### Modèle reçu par le frontend

```json
{
  "id": "507f1f77bcf86cd799439011",
  "measuredAt": "2026-09-29T08:15:00.000Z",
  "weight": 72.5,
  "bodyFat": 20,
  "muscleMass": 30,
  "createdAt": "2026-09-29T08:20:00.000Z",
  "updatedAt": "2026-09-29T08:20:00.000Z"
}
```

Le champ interne `clientId` n'est pas retourné. `bodyFat` et `muscleMass`
peuvent être absents.

### Champs acceptés en écriture

| Champ | Type | Création | Règles |
| --- | --- | --- | --- |
| `measuredAt` | chaîne | obligatoire | Date et heure ISO 8601 avec fuseau horaire |
| `weight` | nombre | obligatoire | Supérieur ou égal à `1` |
| `bodyFat` | nombre ou `null` | facultatif | De `0` à `100`, `null` supprime la valeur |
| `muscleMass` | nombre ou `null` | facultatif | Positif ou nul, `null` supprime la valeur |

Exemples valides pour `measuredAt` : `2026-09-29T10:15:00+02:00` et
`2026-09-29T08:15:00Z`.

### Lister les mesures d'un client

```http
GET /api/clients/:clientId/measurements
```

- Réponse `200` : tableau, éventuellement vide, trié de la mesure la plus
  récente à la plus ancienne.
- Réponse `400` : `clientId` invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

### Lire une mesure

```http
GET /api/clients/:clientId/measurements/:measurementId
```

- Réponse `200` : mesure demandée.
- Réponse `400` : `clientId` ou `measurementId` invalide.
- Réponse `404` : client ou mesure introuvable, mauvais rattachement, ou client
  appartenant à un autre utilisateur.

### Créer une mesure

```http
POST /api/clients/:clientId/measurements
Content-Type: application/json
```

```json
{
  "measuredAt": "2026-09-29T10:15:00+02:00",
  "weight": 72.5,
  "bodyFat": 20,
  "muscleMass": 30
}
```

- Réponse `201` : `{ "id": "identifiant créé" }`.
- Réponse `400` : identifiant ou corps invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

Plusieurs mesures peuvent avoir lieu le même jour. Le frontend doit conserver
l'heure et le fuseau dans `measuredAt`.

### Modifier partiellement une mesure

```http
PATCH /api/clients/:clientId/measurements/:measurementId
Content-Type: application/json
```

Envoyer uniquement les champs à modifier. Au moins un champ est obligatoire.

```json
{
  "weight": 71.8,
  "bodyFat": null
}
```

Cet exemple modifie le poids et supprime la masse grasse.

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant ou corps invalide.
- Réponse `404` : client ou mesure introuvable, mauvais rattachement, ou client
  appartenant à un autre utilisateur.

### Supprimer une mesure

```http
DELETE /api/clients/:clientId/measurements/:measurementId
```

- Réponse `204` sans corps.
- Réponse `400` : `clientId` ou `measurementId` invalide.
- Réponse `404` : client ou mesure introuvable, mauvais rattachement, ou client
  appartenant à un autre utilisateur.

## 7. Récapitulatif des routes

| Méthode | Route | Authentification | Succès |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Non | `200` |
| `GET` | `/api/auth/me` | Session attendue | `200` |
| `POST` | `/api/auth/logout` | Non exigée | `204` |
| `GET` | `/api/clients` | Oui | `200` |
| `GET` | `/api/clients/:clientId` | Oui | `200` |
| `POST` | `/api/clients` | Oui | `201` |
| `PATCH` | `/api/clients/:clientId` | Oui | `200` |
| `DELETE` | `/api/clients/:clientId` | Oui | `204` |
| `GET` | `/api/events` | Oui | `200` |
| `GET` | `/api/events/:eventId` | Oui | `200` |
| `POST` | `/api/events` | Oui | `201` |
| `PATCH` | `/api/events/:eventId` | Oui | `200` |
| `DELETE` | `/api/events/:eventId` | Oui | `204` |
| `GET` | `/api/clients/:clientId/measurements` | Oui | `200` |
| `GET` | `/api/clients/:clientId/measurements/:measurementId` | Oui | `200` |
| `POST` | `/api/clients/:clientId/measurements` | Oui | `201` |
| `PATCH` | `/api/clients/:clientId/measurements/:measurementId` | Oui | `200` |
| `DELETE` | `/api/clients/:clientId/measurements/:measurementId` | Oui | `204` |

## 8. Séquence de démarrage recommandée du frontend

1. Construire `API_BASE_URL` depuis la configuration du frontend.
2. Appeler `GET /auth/me` avec `credentials: "include"`.
3. En cas de `200`, initialiser l'état utilisateur avec la réponse.
4. En cas de `401`, afficher l'écran de connexion.
5. Après `POST /auth/login`, conserver uniquement les informations utilisateur
   dans l'état applicatif. Ne jamais tenter de lire le cookie HTTP-only.
6. Sur un `401` ultérieur, vider l'état utilisateur et rediriger vers la
   connexion.
7. Sur un `400`, afficher `message` et associer les éléments de `errors` aux
   champs du formulaire lorsque `field` est renseigné.
