# CountryGuesser PublicCopy

This public copy showcases selected code from a Vue 3 project. It is not the complete project.

Firebase must be configured manually for the application to work. Create a local `.env` file based on `.envschema`.

## Firestore Schemas

The following Firestore collections and fields are required by the included client and Cloud Functions code.

### `users/{uid}`

Use the Firebase Authentication user UID as the document ID.

| Field | Type | Description |
|---|---|---|
| `avatar` | string | Profile avatar URL |
| `username` | string | User's display name |
| `email` | string | User email address |
| `currentRoom` | string | Room document ID, or an empty string when not in a room |
| `public` | boolean | Whether the profile is publicly visible |
| `createdAt` | string | Account creation time in ISO format |
| `flaguegueses` | number | Flag Guesser count |
| `wlikeGueses` | number | Word Like count |

### `rooms/{roomId}`

Room IDs may be generated automatically by Firestore.

| Field | Type | Description |
|---|---|---|
| `name` | string | Room name |
| `leader` | string | UID of the room leader |
| `state` | string | `waiting`, `playing`, or `results` |
| `players` | map | Map keyed by user UID |
| `players.{uid}.score` | number | Player score |
| `players.{uid}.currentRound` | number | Completed rounds, from `0` to `12` |
| `answers` | array of strings | Country document IDs selected for the game |
| `gameEndTime` | timestamp | Scheduled end time while a game is playing |

New rooms require `name`, `leader`, `players`, and `state`. `answers` and `gameEndTime` are added when the game starts.

### `countries/{countryId}`

The document ID must be the country identifier used in `rooms.answers`.

| Field | Type | Description |
|---|---|---|
| `flags.png` | string | Country flag image URL |
| `latlng` | array of numbers | Latitude and longitude, in that order |

Other country fields may be stored and are returned by `getCountry`, but the included game modes require `flags.png` and `latlng`.

## Google Cloud Services

The project uses Firebase Storage for user avatars, the Google Maps JavaScript API for the world map, and Cloud Tasks to schedule the `endGame` function that closes a multiplayer room after its time limit.

## Firebase and Google Cloud Setup

1. Create or select a Firebase project and authenticate with the Firebase CLI:

   ```sh
   firebase login
   ```

2. Copy `.envschema` to `.env` and fill in `FIREBASE_PROJECT_ID`, the Firebase configuration values, the default avatar URL, and a Google Maps API key. Configure `TASKS_LOCATION` and `TASKS_QUEUE` in the Functions runtime as well (for local emulation, place them in `functions/.env`). The Firebase CLI does not load the root `.env` automatically, so pass the project ID explicitly when running CLI commands:

   ```sh
   firebase deploy --project <project-id>
   ```

3. Enable Email/Password Authentication, create a Firestore database, and enable Firebase Storage.
4. Create the `countries` documents described above and configure Firestore and Storage security rules for the application.
5. Enable the **Maps JavaScript API** for the same Google Cloud project and restrict the key to the application's domains.
6. Enable Cloud Tasks and create the queue named by `TASKS_QUEUE` in the location named by `TASKS_LOCATION`:

   ```sh
   gcloud services enable cloudtasks.googleapis.com
   gcloud tasks queues create <queue-name> --location=<location>
   ```

7. Deploy the Cloud Functions and grant the Cloud Tasks service account permission to invoke `endGame`:

   ```sh
   firebase deploy --only functions --project <project-id>
   ```

   The service account configured in `functions/index.js` must exist in the project and have the appropriate Cloud Functions/Cloud Run Invoker permission.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
