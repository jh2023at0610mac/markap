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

## Posting API setup (Vercel)

1. Firebase Console -> Project Settings -> Service accounts.
2. Generate a new private key JSON.
3. In Vercel Project -> Settings -> Environment Variables, add:
   - `POST_SECRET` (long random value)
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON key as one-line text)
4. Redeploy after adding env vars.
5. Use `POST /api/post-news` with `Authorization: Bearer <POST_SECRET>`.

Full request example is in `POSTING_API.md`.
