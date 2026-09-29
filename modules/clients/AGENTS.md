# AGENTS.md : Module des clients

## Périmètre

Ces instructions s'appliquent au dossier `modules/clients` et complètent les
instructions de `modules/AGENTS.md` et du fichier `AGENTS.md` à la racine.

Toutes les routes de ce module utilisent le préfixe `/api/clients` et nécessitent
une session authentifiée.

Chaque client appartient à l'utilisateur authentifié. Son `ownerId` est lu
depuis la session par le controller et ne doit jamais être accepté dans le corps
ou exposé dans une réponse. Toutes les lectures et mutations doivent filtrer les
clients par cet identifiant.

Les corps de requête sont envoyés au format JSON avec l'en-tête
`Content-Type: application/json`.

## Format d'un client

Un client utilise les propriétés suivantes :

| Propriété | Type | Format et règles |
| --- | --- | --- |
| `firstName` | chaîne | Prénom obligatoire et non vide |
| `lastName` | chaîne | Nom obligatoire et non vide |
| `birthDate` | chaîne | Date ISO au format `YYYY-MM-DD` |
| `height` | nombre entier | Taille strictement positive |
| `weight` | nombre | Poids supérieur ou égal à 1 |
| `bodyFat` | nombre | Facultatif, entre 0 et 100 |
| `muscleMass` | nombre | Facultatif et positif ou nul |
| `objectives` | chaîne | Facultatif, une chaîne vide supprime la valeur |
| `pathologies` | tableau | Liste de chaînes, vide par défaut à la création |
| `limitations` | chaîne | Facultatif, une chaîne vide supprime la valeur |
| `hasEatingDisorder` | booléen | `false` par défaut à la création |
| `emergencyContactName` | chaîne | Facultatif, une chaîne vide supprime la valeur |
| `emergencyContactRelationship` | chaîne | Facultatif, une chaîne vide supprime la valeur |
| `emergencyContactPhone` | chaîne | Facultatif, une chaîne vide supprime la valeur |

Les propriétés inconnues sont refusées. Les champs `ownerId`, `measurements`,
`createdAt` et `updatedAt` sont gérés par l'API et ne doivent pas être envoyés.

## Lire tous les clients

```http
GET /api/clients
```

Cette requête ne reçoit ni paramètre ni corps JSON.

Réponse `200` : tableau des clients appartenant à l'utilisateur connecté.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Camille",
    "lastName": "Martin",
    "birthDate": "1992-03-14T00:00:00.000Z",
    "measurements": [
      {
        "measuredAt": "2026-09-28T08:00:00.000Z",
        "height": 168,
        "weight": 64,
        "bodyFat": 24,
        "muscleMass": 25
      }
    ],
    "objectives": "Améliorer la condition physique générale",
    "pathologies": [],
    "hasEatingDisorder": false,
    "createdAt": "2026-09-29T10:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z"
  }
]
```

## Lire un client

```http
GET /api/clients/:clientId
```

`clientId` doit être un identifiant MongoDB sur 24 caractères hexadécimaux.
Cette requête ne reçoit pas de corps JSON.

- Réponse `200` : client demandé.
- Réponse `400` : identifiant invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

## Créer un client

```http
POST /api/clients
```

Les champs `firstName`, `lastName`, `birthDate`, `height` et `weight` sont
obligatoires. Les autres champs sont facultatifs.

```json
{
  "firstName": "Camille",
  "lastName": "Martin",
  "birthDate": "1992-03-14",
  "height": 168,
  "weight": 64,
  "bodyFat": 24,
  "muscleMass": 25,
  "objectives": "Améliorer la condition physique générale",
  "pathologies": [],
  "limitations": "",
  "hasEatingDisorder": false,
  "emergencyContactName": "Julien Martin",
  "emergencyContactRelationship": "Conjoint",
  "emergencyContactPhone": "0600000001"
}
```

La première mesure est créée automatiquement à partir de `height`, `weight`,
`bodyFat` et `muscleMass`.

- Réponse `201` : `{ "id": "identifiant créé" }`.
- Réponse `400` : données invalides.

## Modifier partiellement un client

```http
PATCH /api/clients/:clientId
```

Le corps contient uniquement les propriétés à modifier. Au moins une propriété
doit être fournie. Les autres propriétés restent inchangées.

```json
{
  "weight": 62.5,
  "objectives": "Préparer une course"
}
```

Les propriétés de mesure fournies modifient uniquement la dernière mesure
enregistrée. Elles ne créent pas une nouvelle entrée dans l'historique.

- Réponse `200` : `{ "id": "identifiant modifié" }`.
- Réponse `400` : identifiant ou données invalides.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

## Supprimer un client

```http
DELETE /api/clients/:clientId
```

`clientId` doit être un identifiant MongoDB sur 24 caractères hexadécimaux.
Cette requête ne reçoit pas de corps JSON.

La suppression est atomique. Tous les événements de type `coaching` associés au
client et appartenant au même utilisateur sont également supprimés. Les cours
collectifs ne sont pas concernés.

- Réponse `204` : client supprimé, sans corps de réponse.
- Réponse `400` : identifiant invalide.
- Réponse `404` : client introuvable ou appartenant à un autre utilisateur.

## Erreurs communes

- `401` : session absente ou expirée.
- `500` : erreur interne non prévue.

Ne jamais exposer un détail technique, une trace d'erreur ou une donnée de
connexion dans une réponse HTTP.
