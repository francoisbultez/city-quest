# Together mode: Firebase setup

Together mode syncs the team through Firebase Realtime Database. Until
`web/src/lib/team/config.ts` has a config, it runs on a local stand-in
(two tabs in one browser can play together, which is what the tests use).

1. Firebase console → Add project `city-quest` (Analytics not needed).
2. Build → Realtime Database → Create database → `europe-west1` → start in locked mode.
3. Build → Authentication → Get started → Sign-in method → enable **Anonymous**.
4. Project settings → Your apps → Web app → copy `firebaseConfig` into `config.ts`.
5. Realtime Database → Rules → paste:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "games": {
      "$code": {
        ".validate": "$code.matches(/^[A-Z0-9]{4}$/)",
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

The web config is public by design; the rules are what protect the data.
