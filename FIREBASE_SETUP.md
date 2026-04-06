# Firebase setup (Markap)

1. Firebase Console -> create/select project.
2. Enable **Authentication -> Sign-in method -> Email/Password**.
3. Create at least one admin user in **Authentication -> Users**.
4. Enable **Firestore Database** (production mode).
5. Create collection name: `news`.
6. Open `firebase-config.js` and replace all `REPLACE_WITH_...` values with your web app config.

## Firestore rules

Use these rules so readers can read, but only authenticated admins can write:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /news/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

If you want stricter control later, you can require `request.auth.token.admin == true`.
