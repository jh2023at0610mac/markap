# Markap Posting API

Use this endpoint to publish ready-made articles from your other system.

**Vacancies:** same `POST_SECRET` and env vars — see [POSTING_VACANCIES_API.md](./POSTING_VACANCIES_API.md) (`POST /api/post-vacancy`).

## Endpoint

- `POST https://markap.vercel.app/api/post-news`
- Auth header: `Authorization: Bearer <POST_SECRET>`
- Content-Type: `application/json`

## Request body

```json
{
  "id": "optional-article-id",
  "title": "Başlıq",
  "category": "Siyasət",
  "image": "https://example.com/image.jpg",
  "excerpt": "Qısa mətn",
  "content": "Ətraflı xəbər mətni",
  "createdAtMs": 1775490000000,
  "views": 0,
  "status": "published"
}
```

### Required fields

- `title`
- `content`

All others are optional.

## cURL example

```bash
curl -X POST "https://markap.vercel.app/api/post-news" \
  -H "Authorization: Bearer YOUR_POST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test xəbər",
    "category": "Hadisə",
    "excerpt": "Qısa təsvir",
    "content": "Bu, test üçün göndərilən xəbər mətnidir.",
    "image": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80"
  }'
```

## Required Vercel env vars

- `POST_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

`FIREBASE_SERVICE_ACCOUNT_JSON` should be the full JSON key from Firebase Service Accounts as a single-line string.
